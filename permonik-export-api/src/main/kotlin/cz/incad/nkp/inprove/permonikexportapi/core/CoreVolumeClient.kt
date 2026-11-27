package cz.incad.nkp.inprove.permonikexportapi.core

import com.google.protobuf.Timestamp
import cz.incad.nkp.inprove.permonikcorecontract.v1.BatchGetVolumeContentsRequest
import cz.incad.nkp.inprove.permonikcorecontract.v1.CoreExportServiceGrpc
import cz.incad.nkp.inprove.permonikcorecontract.v1.GrpcMutationMark
import cz.incad.nkp.inprove.permonikcorecontract.v1.GrpcMutationalEditionFilter
import cz.incad.nkp.inprove.permonikcorecontract.v1.GrpcVolume
import cz.incad.nkp.inprove.permonikcorecontract.v1.GrpcVolumeContents
import cz.incad.nkp.inprove.permonikcorecontract.v1.QueryPlanningVolumesRequest
import cz.incad.nkp.inprove.permonikcorecontract.v1.SearchReplacementVolumesRequest
import cz.incad.nkp.inprove.permonikexportapi.calculation.SpecimenMatchingRules
import cz.incad.nkp.inprove.permonikexportapi.planning.PlanningFacet
import cz.incad.nkp.inprove.permonikexportapi.planning.PlanningFacets
import cz.incad.nkp.inprove.permonikexportapi.planning.PlanningMutation
import cz.incad.nkp.inprove.permonikexportapi.planning.TemplatePlanningQuery
import cz.incad.nkp.inprove.permonikexportapi.template.LocalizedName
import cz.incad.nkp.inprove.permonikexportapi.template.MutationMark
import cz.incad.nkp.inprove.permonikexportapi.template.MutationMarkType
import io.grpc.Context
import io.grpc.Status
import java.time.Instant
import java.util.concurrent.TimeUnit
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.grpc.client.GrpcChannelFactory
import org.springframework.grpc.client.interceptor.security.BearerTokenAuthenticationInterceptor
import org.springframework.stereotype.Component

@Configuration(proxyBeanMethods = false)
class CoreVolumeClientConfiguration {
    /**
     * Uses Boot's managed named channel and sends only the explicit service token, never the
     * browser JWT.
     */
    @Bean
    fun coreVolumeStub(
        factory: GrpcChannelFactory,
        properties: CoreExportClientProperties,
    ): CoreExportServiceGrpc.CoreExportServiceBlockingStub =
        CoreExportServiceGrpc.newBlockingStub(factory.createChannel("core"))
            .withInterceptors(BearerTokenAuthenticationInterceptor(properties.token))
}

@Component
class CoreVolumeClient(
    private val stub: CoreExportServiceGrpc.CoreExportServiceBlockingStub,
    private val properties: CoreExportClientProperties,
) {
    /** Metadata identifying the planning volume and its owner. */
    data class PlanningVolumeMetadata(
        val id: String,
        val barCode: String,
        val ownerId: String,
        val ownerShorthand: String,
    )

    /** Drains the candidate metadata stream before ranking without exposing partial results. */
    fun searchReplacementVolumeIds(
        primaryVolumeId: String,
        rules: SpecimenMatchingRules,
    ): List<String> {
        require(primaryVolumeId.isNotBlank()) { "Primary volume ID is required" }
        val context = Context.current().withCancellation()
        return try {
            context.call {
                val ids = linkedSetOf<String>()
                val request =
                    SearchReplacementVolumesRequest.newBuilder()
                        .setPrimaryVolumeId(primaryVolumeId)
                        .setMatchOwner(rules.matchOwner)
                        .setMatchMutation(rules.matchMutation)
                        .setMatchMutationalEdition(rules.matchMutationalEdition)
                        .build()
                val stream =
                    stub
                        .withDeadlineAfter(properties.deadline.toNanos(), TimeUnit.NANOSECONDS)
                        .searchReplacementVolumes(request)
                for (volume in stream) {
                    if (
                        volume.id.isBlank() || volume.id == primaryVolumeId || !ids.add(volume.id)
                    ) {
                        throw Status.DATA_LOSS.withDescription(
                                "Invalid replacement search response"
                            )
                            .asRuntimeException()
                    }
                }
                ids.toList()
            }
        } finally {
            context.cancel(null)
        }
    }

    /**
     * Assembles streamed records and returns ordered snapshots only after successful gRPC
     * completion.
     */
    fun batchGetVolumeContents(ids: List<String>): List<StoredVolumeSnapshot> {
        require(ids.size in 1..20 && ids.none(String::isBlank) && ids.distinct().size == ids.size) {
            "Expected 1..20 distinct nonblank volume IDs"
        }
        val context = Context.current().withCancellation()
        return try {
            context.call {
                val stream =
                    stub
                        .withDeadlineAfter(properties.deadline.toNanos(), TimeUnit.NANOSECONDS)
                        .batchGetVolumeContents(
                            BatchGetVolumeContentsRequest.newBuilder().addAllVolumeIds(ids).build()
                        )
                try {
                    val contentsById = linkedMapOf<String, GrpcVolumeContents.Builder>()
                    val specimenIds = mutableSetOf<String>()
                    while (stream.hasNext()) {
                        val frame = stream.next()
                        when {
                            frame.hasVolume() -> {
                                require(
                                    contentsById.size < ids.size &&
                                        frame.volume.id == ids[contentsById.size]
                                )
                                contentsById[frame.volume.id] =
                                    GrpcVolumeContents.newBuilder().setVolume(frame.volume)
                            }
                            frame.hasSpecimen() -> {
                                require(
                                    contentsById.keys.toList() == ids &&
                                        frame.specimen.hasSpecimen()
                                )
                                val target = requireNotNull(contentsById[frame.specimen.volumeId])
                                val specimen = frame.specimen.specimen
                                require(specimen.id.isNotBlank() && specimenIds.add(specimen.id))
                                target.addSpecimens(specimen)
                            }
                            else -> throw IllegalArgumentException("Missing stream record")
                        }
                    }
                    require(contentsById.keys.toList() == ids)
                    contentsById.values.map { builder ->
                        val contents = builder.build()
                        contents.toSnapshot()
                    }
                } catch (_: IllegalArgumentException) {
                    throw Status.DATA_LOSS.withDescription("Invalid core volume response")
                        .asRuntimeException()
                }
            }
        } finally {
            context.cancel(null)
        }
    }

    /** Shares exact filter encoding between the plan and its facet counts. */
    private fun planningRequest(query: TemplatePlanningQuery): QueryPlanningVolumesRequest {
        val request =
            QueryPlanningVolumesRequest.newBuilder()
                .setMetaTitleId(query.metaTitleId)
                .setYearFrom(query.yearFrom)
                .setYearTo(query.yearTo)
        query.mutation?.id?.let(request::setMutationId)
        query.mutationalEdition?.let { edition ->
            val filter = GrpcMutationalEditionFilter.newBuilder()
            edition.mark?.let(filter::setMark)
            edition.type?.let { filter.setType(it.name) }
            request.setMutationalEdition(filter)
        }
        return request.build()
    }

    /** Reads both planning facets without loading stored volumes or specimens. */
    fun queryPlanningFacets(query: TemplatePlanningQuery): PlanningFacets {
        val response =
            stub.withDeadlineAfter(2, TimeUnit.SECONDS).queryPlanningFacets(planningRequest(query))
        return PlanningFacets(
            mutations =
                response.mutationsList.map {
                    val name = it.name
                    if (
                        !it.hasName() || name.cs.isBlank() || name.sk.isBlank() || name.en.isBlank()
                    ) {
                        throw Status.DATA_LOSS.withDescription("Missing planning mutation name")
                            .asRuntimeException()
                    }
                    PlanningFacet(
                        PlanningMutation(it.mutationId, LocalizedName(name.cs, name.sk, name.en)),
                        it.count,
                    )
                },
            mutationalEditions =
                response.mutationalEditionsList.map {
                    PlanningFacet(
                        MutationMark(
                            type = MutationMarkType.valueOf(it.type),
                            mark = it.mark.takeIf { _ -> it.hasMark() },
                        ),
                        it.count,
                    )
                },
        )
    }

    /** Drains the core planning stream without calculating indexes. */
    fun queryPlanningVolumes(query: TemplatePlanningQuery): List<PlanningVolumeMetadata> {
        val request = planningRequest(query)
        val context = Context.current().withCancellation()
        return try {
            context.call {
                val result = mutableListOf<PlanningVolumeMetadata>()
                val ids = mutableSetOf<String>()
                val stream =
                    stub
                        .withDeadlineAfter(properties.deadline.toNanos(), TimeUnit.NANOSECONDS)
                        .queryPlanningVolumes(request)
                try {
                    for (volume in stream) {
                        val metadata = volume.toPlanningMetadata()
                        if (!ids.add(metadata.id)) {
                            throw Status.DATA_LOSS.withDescription("Duplicate planning volume")
                                .asRuntimeException()
                        }
                        result += metadata
                    }
                } catch (_: IllegalArgumentException) {
                    throw Status.DATA_LOSS.withDescription("Invalid planning volume response")
                        .asRuntimeException()
                }
                result
            }
        } finally {
            context.cancel(null)
        }
    }
}

/** Validates metadata returned for a planning volume. */
private fun GrpcVolume.toPlanningMetadata(): CoreVolumeClient.PlanningVolumeMetadata {
    require(
        id.isNotBlank() &&
            hasBarcode() &&
            hasDateFrom() &&
            hasDateTo() &&
            hasOwner() &&
            owner.hasId() &&
            owner.hasShorthand()
    )
    return CoreVolumeClient.PlanningVolumeMetadata(
        id,
        barCode = barcode,
        ownerId = owner.id,
        ownerShorthand = owner.shorthand,
    )
}

/** Preserves source presence and exact timestamps without inferring calculation inputs. */
private fun GrpcVolumeContents.toSnapshot(): StoredVolumeSnapshot = volume.let { source ->
    require(
        source.hasBarcode() &&
            source.hasDateFrom() &&
            source.hasDateTo() &&
            source.hasMetaTitleId() &&
            source.hasMetaTitleName() &&
            source.hasMutationId() &&
            source.hasMutationName() &&
            source.hasMutationMark() &&
            source.hasOwner() &&
            source.hasYear() &&
            source.hasFirstNumber() &&
            source.hasLastNumber() &&
            source.hasAttachmentsSort() &&
            source.hasPeriodicity() &&
            source.hasCreated() &&
            source.hasCreatedBy()
    )
    require(
        source.mutationName.hasCs() && source.mutationName.hasSk() && source.mutationName.hasEn()
    )
    require(
        source.owner.hasId() &&
            source.owner.hasName() &&
            source.owner.hasShorthand() &&
            source.owner.hasSigla()
    )
    StoredVolumeSnapshot(
        id = source.id,
        barcode = source.barcode,
        dateFrom = source.dateFrom.toInstant(),
        dateTo = source.dateTo.toInstant(),
        metaTitleId = source.metaTitleId,
        metaTitleName = source.metaTitleName,
        subName = source.subName.takeIf { source.hasSubName() },
        mutationId = source.mutationId,
        mutationName =
            source.mutationName.let {
                StoredLocalizedName(it.cs, it.sk, it.en)
            },
        mutationMark = source.mutationMark.toSnapshot(),
        owner =
            source.owner.let {
                StoredOwner(id = it.id, name = it.name, shorthand = it.shorthand, sigla = it.sigla)
            },
        signature = source.signature.takeIf { source.hasSignature() },
        year = source.year,
        firstNumber = source.firstNumber,
        lastNumber = source.lastNumber,
        note = source.note.takeIf { source.hasNote() },
        attachmentsSort = source.attachmentsSort,
        periodicity =
            source.periodicity.itemsList.map { item ->
                require(
                    item.hasDay() &&
                        item.hasNumExists() &&
                        item.hasEditionId() &&
                        item.hasPagesCount() &&
                        item.hasName() &&
                        item.hasSubName() &&
                        item.hasIsAttachment()
                )
                StoredPeriodicityItem(
                    day = item.day,
                    numExists = item.numExists,
                    editionId = item.editionId,
                    pagesCount = item.pagesCount,
                    name = item.name,
                    subName = item.subName,
                    isAttachment = item.isAttachment,
                )
            },
        created = source.created.toInstant(),
        createdBy = source.createdBy,
        updated = source.updated.takeIf { source.hasUpdated() }?.toInstant(),
        updatedBy = source.updatedBy.takeIf { source.hasUpdatedBy() },
        specimens =
            specimensList.map { item ->
                require(
                    item.hasPublicationDate() &&
                        item.hasIsAttachment() &&
                        item.hasEditionId() &&
                        item.hasMutationId() &&
                        item.hasMutationMark() &&
                        item.hasNumExists() &&
                        item.hasNumMissing() &&
                        item.hasPagesCount()
                )
                StoredSpecimenSnapshot(
                    id = item.id,
                    publicationDate = item.publicationDate.toInstant(),
                    isAttachment = item.isAttachment,
                    number = item.number.takeIf { item.hasNumber() },
                    attachmentNumber = item.attachmentNumber.takeIf { item.hasAttachmentNumber() },
                    editionId = item.editionId,
                    mutationId = item.mutationId,
                    mutationMark = item.mutationMark.toSnapshot(),
                    name = item.name.takeIf { item.hasName() },
                    subName = item.subName.takeIf { item.hasSubName() },
                    numExists = item.numExists,
                    numMissing = item.numMissing,
                    pagesCount = item.pagesCount,
                    missingPages = item.missingPagesList.toList(),
                    damagedPages = item.damagedPagesList.toList(),
                    damageTypes = item.damageTypesList.toList(),
                    note = item.note.takeIf { item.hasNote() },
                )
            },
    )
}

/** Requires the stored type while retaining optional text and unrecognized type strings. */
private fun GrpcMutationMark.toSnapshot(): StoredMutationMark {
    require(hasType())
    return StoredMutationMark(
        mark.takeIf { hasMark() },
        type,
        description.takeIf { hasDescription() },
    )
}

/** Validates protobuf timestamp bounds before preserving their exact instant. */
private fun Timestamp.toInstant(): Instant {
    require(seconds in -62135596800L..253402300799L && nanos in 0..999999999)
    return Instant.ofEpochSecond(seconds, nanos.toLong())
}
