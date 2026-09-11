package cz.incad.nkp.inprove.permonikapi.grpc;

import com.google.protobuf.CodedOutputStream;
import com.google.protobuf.Timestamp;
import cz.incad.nkp.inprove.permonikapi.common.ReferenceDataService;
import cz.incad.nkp.inprove.permonikapi.specimen.SpecimenService;
import cz.incad.nkp.inprove.permonikapi.specimen.model.Specimen;
import cz.incad.nkp.inprove.permonikapi.volume.model.Volume;
import cz.incad.nkp.inprove.permonikapi.volume.mapper.PeriodicityMapper;
import cz.incad.nkp.inprove.permonikcorecontract.v1.BatchGetVolumeContentsRequest;
import cz.incad.nkp.inprove.permonikcorecontract.v1.BatchGetVolumeContentsResponse;
import cz.incad.nkp.inprove.permonikcorecontract.v1.CoreExportServiceGrpc;
import cz.incad.nkp.inprove.permonikcorecontract.v1.GrpcLocalizedName;
import cz.incad.nkp.inprove.permonikcorecontract.v1.GrpcMutationMark;
import cz.incad.nkp.inprove.permonikcorecontract.v1.GrpcOwner;
import cz.incad.nkp.inprove.permonikcorecontract.v1.GrpcPeriodicity;
import cz.incad.nkp.inprove.permonikcorecontract.v1.GrpcPeriodicityItem;
import cz.incad.nkp.inprove.permonikcorecontract.v1.GrpcSpecimen;
import cz.incad.nkp.inprove.permonikcorecontract.v1.GrpcVolume;
import cz.incad.nkp.inprove.permonikcorecontract.v1.GrpcVolumeContents;
import cz.incad.nkp.inprove.permonikcorecontract.v1.GrpcVolumePage;
import cz.incad.nkp.inprove.permonikcorecontract.v1.SearchReplacementVolumesRequest;
import io.grpc.Context;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import org.apache.solr.client.solrj.SolrServerException;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.util.Date;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.function.Consumer;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CoreExportGrpcService extends CoreExportServiceGrpc.CoreExportServiceImplBase {
    private final SpecimenService specimens;
    private final ReferenceDataService references;
    private final PeriodicityMapper periodicityMapper;
    private final CoreExportGrpcProperties properties;

    /** Returns candidate metadata only; projected coverage and source ranking belong to export. */
    @Override
    public void searchReplacementVolumes(SearchReplacementVolumesRequest request, StreamObserver<GrpcVolumePage> observer) {
        try {
            int pageSize = request.getPage().getPageSize();
            if (request.getPrimaryVolumeId().isBlank() || pageSize < 0 || pageSize > 100) {
                throw Status.INVALID_ARGUMENT.withDescription("Expected primary ID and page size 0..100").asRuntimeException();
            }
            var primary = references.getVolumesByIds(List.of(request.getPrimaryVolumeId()));
            if (primary.isEmpty()) throw Status.NOT_FOUND.withDescription("Primary volume not found").asRuntimeException();
            toVolumeMessage(primary.getFirst());
            var page = references.searchReplacementVolumes(primary.getFirst(), request.getMatchOwner(),
                    request.getMatchMutation(), request.getMatchMutationalEdition(), pageSize == 0 ? 20 : pageSize,
                    request.getPage().getPageToken());
            var response = GrpcVolumePage.newBuilder().setNextPageToken(page.nextPageToken());
            for (var volume : page.volumes()) {
                response.addVolumes(toVolumeMessage(volume));
                checkBudget(response.build().getSerializedSize());
            }
            var result = response.build();
            checkBudget(result.getSerializedSize());
            observer.onNext(result);
            observer.onCompleted();
        } catch (StatusRuntimeException exception) {
            observer.onError(exception);
        } catch (IllegalArgumentException exception) {
            observer.onError(Status.INVALID_ARGUMENT.withDescription("Invalid replacement search or page token").asRuntimeException());
        } catch (SolrServerException | IOException exception) {
            observer.onError(Status.UNAVAILABLE.withDescription("Core data store unavailable or incomplete").asRuntimeException());
        } catch (Exception exception) {
            observer.onError(Status.INTERNAL.withDescription("Cannot search replacement volumes").asRuntimeException());
        }
    }

    /** Loads a complete ordered batch or fails the whole call; no ideal-list inference or partial success. */
    @Override
    public void batchGetVolumeContents(BatchGetVolumeContentsRequest request,
                                      StreamObserver<BatchGetVolumeContentsResponse> observer) {
        try {
            observer.onNext(loadVolumeContents(request.getVolumeIdsList()));
            observer.onCompleted();
        } catch (StatusRuntimeException exception) {
            observer.onError(exception);
        } catch (SolrServerException | IOException exception) {
            observer.onError(Status.UNAVAILABLE.withDescription("Core data store unavailable or incomplete").asRuntimeException());
        } catch (Exception exception) {
            observer.onError(Status.INTERNAL.withDescription("Cannot read core volume contents").asRuntimeException());
        }
    }

    /** Collects stored volumes and specimens in request order while enforcing the response size limit. */
    private BatchGetVolumeContentsResponse loadVolumeContents(List<String> ids)
            throws SolrServerException, IOException {
        if (ids.isEmpty() || ids.size() > 20 || ids.stream().anyMatch(String::isBlank)
                || new HashSet<>(ids).size() != ids.size()) {
            throw Status.INVALID_ARGUMENT.withDescription("Expected 1..20 distinct nonblank volume IDs").asRuntimeException();
        }
        Map<String, Volume> found = references.getVolumesByIds(ids).stream()
                .collect(Collectors.toMap(volume -> required(volume.getId(), "volume.id"), Function.identity()));
        if (!found.keySet().containsAll(ids)) {
            throw Status.NOT_FOUND.withDescription("Requested volume not found").asRuntimeException();
        }

        Map<String, GrpcVolumeContents.Builder> contents = new LinkedHashMap<>();
        long[] bytes = {0};
        for (String id : ids) {
            var message = toVolumeMessage(found.get(id));
            contents.put(id, GrpcVolumeContents.newBuilder().setVolume(message));
            bytes[0] += CodedOutputStream.computeMessageSize(1, message);
            checkBudget(bytes[0]);
        }
        specimens.forEachSpecimenByVolumeIds(ids, source -> {
            var message = toSpecimenMessage(source);
            bytes[0] += CodedOutputStream.computeMessageSize(2, message);
            checkBudget(bytes[0]);
            contents.get(required(source.getVolumeId(), "specimen.volume_id")).addSpecimens(message);
        });

        var response = BatchGetVolumeContentsResponse.newBuilder();
        contents.values().forEach(response::addVolumes);
        var result = response.build();
        checkBudget(result.getSerializedSize());
        return result;
    }

    /** Maps stored metadata without REST normalization or date rounding. */
    private GrpcVolume toVolumeMessage(Volume source) {
        if (required(source.getDateFrom(), "volume.date_from").after(required(source.getDateTo(), "volume.date_to"))) {
            throw Status.DATA_LOSS.withDescription("Inverted volume date interval").asRuntimeException();
        }
        var target = GrpcVolume.newBuilder()
                .setId(required(source.getId(), "volume.id"))
                .setBarcode(required(source.getBarCode(), "volume.barcode"))
                .setDateFrom(timestamp(required(source.getDateFrom(), "volume.date_from")))
                .setDateTo(timestamp(required(source.getDateTo(), "volume.date_to")))
                .setMetaTitleId(required(source.getMetaTitleId(), "volume.metatitle_id"))
                .setMetaTitleName(required(source.getMetaTitleName(), "volume.metatitle_name"))
                .setMutationId(required(source.getMutationId(), "volume.mutation_id"))
                .setMutationName(GrpcLocalizedName.newBuilder()
                        .setCs(required(source.getMutationCsName(), "volume.mutation_name_cs"))
                        .setSk(required(source.getMutationSkName(), "volume.mutation_name_sk"))
                        .setEn(required(source.getMutationEnName(), "volume.mutation_name_en")))
                .setMutationMark(mark(source.rawMutationMark(),
                        required(source.getMutationMarkType(), "volume.mutation_mark_type"), source.rawMutationMarkDescription()))
                .setOwner(GrpcOwner.newBuilder()
                        .setId(required(source.getOwnerId(), "volume.owner_id"))
                        .setName(required(source.getOwnerName(), "volume.owner_name"))
                        .setShorthand(required(source.getOwnerShorthand(), "volume.owner_shorthand"))
                        .setSigla(required(source.getOwnerSigla(), "volume.owner_sigla")))
                .setYear(required(source.getYear(), "volume.year"))
                .setFirstNumber(required(source.getFirstNumber(), "volume.first_number"))
                .setLastNumber(required(source.getLastNumber(), "volume.last_number"))
                .setAttachmentsSort(required(source.getAttachmentsSort(), "volume.attachments_sort"))
                .setCreated(timestamp(required(source.getCreated(), "volume.created")))
                .setCreatedBy(required(source.getCreatedBy(), "volume.created_by"));
        present(source.rawSubName(), target::setSubName);
        present(source.rawSignature(), target::setSignature);
        present(source.rawNote(), target::setNote);
        target.setPeriodicity(toPeriodicityMessage(required(source.getPeriodicity(), "volume.periodicity")));
        present(source.getUpdated(), date -> target.setUpdated(timestamp(date)));
        present(source.getUpdatedBy(), target::setUpdatedBy);
        return target.build();
    }

    /** Requires every periodicity member while preserving false flags, zero counts and empty text. */
    private GrpcPeriodicity toPeriodicityMessage(String json) {
        var periodicity = GrpcPeriodicity.newBuilder();
        for (var item : periodicityMapper.toList(json)) {
            required(item, "volume.periodicity.item");
            periodicity.addItems(GrpcPeriodicityItem.newBuilder()
                    .setDay(required(item.day(), "volume.periodicity.day"))
                    .setNumExists(required(item.numExists(), "volume.periodicity.numExists"))
                    .setEditionId(required(item.editionId(), "volume.periodicity.editionId"))
                    .setPagesCount(required(item.pagesCount(), "volume.periodicity.pagesCount"))
                    .setName(required(item.name(), "volume.periodicity.name"))
                    .setSubName(required(item.subName(), "volume.periodicity.subName"))
                    .setIsAttachment(required(item.isAttachment(), "volume.periodicity.isAttachment")));
        }
        return periodicity.build();
    }

    /** Preserves raw flags, unknown damage codes, and duplicate or invalid page numbers. */
    private static GrpcSpecimen toSpecimenMessage(Specimen source) {
        var target = GrpcSpecimen.newBuilder()
                .setId(required(source.getId(), "specimen.id"))
                .setPublicationDate(timestamp(required(source.getPublicationDate(), "specimen.publication_date")))
                .setIsAttachment(required(source.getIsAttachment(), "specimen.is_attachment"))
                .setEditionId(required(source.getEditionId(), "specimen.edition_id"))
                .setMutationId(required(source.getMutationId(), "specimen.mutation_id"))
                .setMutationMark(mark(source.rawMutationMark(),
                        required(source.getMutationMarkType(), "specimen.mutation_mark_type"), source.rawMutationMarkDescription()))
                .setNumExists(required(source.getNumExists(), "specimen.num_exists"))
                .setNumMissing(required(source.getNumMissing(), "specimen.num_missing"))
                .setPagesCount(required(source.getPagesCount(), "specimen.pages_count"));
        present(source.rawNumber(), target::setNumber);
        present(source.rawAttachmentNumber(), target::setAttachmentNumber);
        present(source.rawName(), target::setName);
        present(source.rawSubName(), target::setSubName);
        return target.addAllMissingPages(source.getMissingPages()).addAllDamagedPages(source.getDamagedPages())
                .addAllDamageTypes(source.getDamageTypes()).build();
    }

    /** Keeps optional mark text and arbitrary stored type strings intact. */
    private static GrpcMutationMark mark(@Nullable String mark, String type, @Nullable String description) {
        var target = GrpcMutationMark.newBuilder().setType(type);
        present(mark, target::setMark);
        present(description, target::setDescription);
        return target.build();
    }

    /** Preserves exact instants, including dates before the epoch, within protobuf bounds. */
    private static Timestamp timestamp(Date date) {
        var instant = date.toInstant();
        if (instant.getEpochSecond() < -62135596800L || instant.getEpochSecond() > 253402300799L) {
            throw new IllegalArgumentException("Source date outside protobuf timestamp range");
        }
        return Timestamp.newBuilder().setSeconds(instant.getEpochSecond()).setNanos(instant.getNano()).build();
    }

    /** Sets only present values, preserving false, zero and empty strings. */
    private static <T> void present(@Nullable T value, Consumer<T> setter) {
        if (value != null) setter.accept(value);
    }

    /** Rejects incomplete stored projections without inventing scalar defaults. */
    private static <T> T required(@Nullable T value, String field) {
        if (value == null) {
            throw Status.DATA_LOSS.withDescription("Missing required Solr field: " + field).asRuntimeException();
        }
        return value;
    }

    /** Bounds retained response data during collection and checks the exact final protobuf size. */
    private void checkBudget(long bytes) {
        if (Context.current().isCancelled()) throw Status.CANCELLED.asRuntimeException();
        if (bytes > properties.maxResponseBytes()) {
            throw Status.RESOURCE_EXHAUSTED.withDescription("Volume contents exceed response limit; reduce batch size")
                    .asRuntimeException();
        }
    }
}
