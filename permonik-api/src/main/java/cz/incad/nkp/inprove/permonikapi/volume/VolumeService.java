package cz.incad.nkp.inprove.permonikapi.volume;

import static cz.incad.nkp.inprove.permonikapi.audit.AuditableDefinition.DELETED_FIELD;

import cz.incad.nkp.inprove.permonikapi.common.ReferenceDataService;
import cz.incad.nkp.inprove.permonikapi.config.security.OwnerAuthorizationService;
import cz.incad.nkp.inprove.permonikapi.metaTitle.MetaTitle;
import cz.incad.nkp.inprove.permonikapi.metaTitle.MetaTitleService;
import cz.incad.nkp.inprove.permonikapi.mutation.model.Mutation;
import cz.incad.nkp.inprove.permonikapi.owner.Owner;
import cz.incad.nkp.inprove.permonikapi.specimen.SpecimenService;
import cz.incad.nkp.inprove.permonikapi.specimen.dto.SpecimensForVolumeOverviewStatsDTO;
import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDTO;
import cz.incad.nkp.inprove.permonikapi.volume.dto.EditableVolumeWithSpecimensDTO;
import cz.incad.nkp.inprove.permonikapi.volume.dto.VolumeDetailDTO;
import cz.incad.nkp.inprove.permonikapi.volume.dto.VolumeOverviewStatsDTO;
import cz.incad.nkp.inprove.permonikapi.volume.model.Volume;
import cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDTO;
import cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition;
import cz.incad.nkp.inprove.permonikapi.volume.model.VolumeMapper;
import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.request.SolrQuery;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.client.solrj.util.ClientUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class VolumeService implements VolumeDefinition {

    private static final Logger logger = LoggerFactory.getLogger(VolumeService.class);

    private final MetaTitleService metaTitleService;
    private final SpecimenService specimenService;
    private final SolrClient solrClient;
    private final VolumeMapper volumeMapper;
    private final ReferenceDataService referenceDataService;
    private final OwnerAuthorizationService ownerAuthorization;

    public VolumeDTO getVolumeDTOById(String volumeId) throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(ID_FIELD + ":\"" + ClientUtils.escapeQueryChars(volumeId) + "\"");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setRows(1);
        QueryResponse response = solrClient.query(VOLUME_CORE_NAME, solrQuery);

        List<Volume> volumeList = response.getBeans(Volume.class);

        if (volumeList.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        Volume volume = volumeList.getFirst();

        // Check metaTitle for not logged-in user. If a user is not logged in and metaTitle isn't
        // public, throw an error
        metaTitleService.getMetaTitleById(volume.getMetaTitleId());

        return volumeMapper.toDTO(volumeList.getFirst());
    }

    public Volume checkVolumeExistsById(String volumeId) throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(ID_FIELD + ":\"" + ClientUtils.escapeQueryChars(volumeId) + "\"");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setRows(1);

        QueryResponse response = solrClient.query(VOLUME_CORE_NAME, solrQuery);

        List<Volume> volumeList = response.getBeans(Volume.class);

        if (volumeList.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        return volumeList.getFirst();
    }

    public VolumeDetailDTO getVolumeDetailById(String volumeId, Boolean onlyPublic)
            throws SolrServerException, IOException {

        VolumeDTO volumeDTO = getVolumeDTOById(volumeId);

        try {
            List<SpecimenDTO> specimenList =
                    specimenService.getSpecimensForVolumeDetail(
                            volumeDTO.getId(), onlyPublic, volumeDTO.getAttachmentsSort());

            return new VolumeDetailDTO(volumeDTO, specimenList);
        } catch (SolrServerException | IOException e) {
            throw new RuntimeException(e);
        }
    }

    public VolumeOverviewStatsDTO getVolumeOverviewStats(String volumeId)
            throws SolrServerException, IOException {

        VolumeDTO volumeDTO = getVolumeDTOById(volumeId);

        MetaTitle metaTitle = metaTitleService.getMetaTitleById(volumeDTO.getMetaTitleId());

        SpecimensForVolumeOverviewStatsDTO specimensForVolumeOverview =
                specimenService.getSpecimensForVolumeOverviewStats(volumeId);

        return new VolumeOverviewStatsDTO(
                metaTitle.getName(),
                volumeDTO.getOwnerId(),
                volumeDTO.getSignature(),
                volumeDTO.getBarCode(),
                specimensForVolumeOverview.publicationDayMin(),
                specimensForVolumeOverview.publicationDayMax(),
                specimensForVolumeOverview.pagesCount(),
                specimensForVolumeOverview.mutationIds(),
                specimensForVolumeOverview.mutationMarks(),
                specimensForVolumeOverview.editionIds(),
                specimensForVolumeOverview.damageTypes(),
                specimensForVolumeOverview.publicationDayRanges(),
                specimensForVolumeOverview.specimens());
    }

    private void createVolume(VolumeDTO volumeDTO) throws SolrServerException, IOException {
        try {
            volumeDTO.prePersist();

            Volume volume = volumeMapper.toModel(volumeDTO);
            resolveVolumeReferenceNames(volume, volumeDTO);

            solrClient.addBean(VOLUME_CORE_NAME, volume);
            solrClient.commit(VOLUME_CORE_NAME);
            logger.info("volume {} successfully created", volumeDTO.getId());
        } catch (Exception e) {
            throw new RuntimeException("Failed to create volume", e);
        }
    }

    private void updateVolume(VolumeDTO volumeDTO) throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(
                BAR_CODE_FIELD
                        + ":\""
                        + ClientUtils.escapeQueryChars(volumeDTO.getBarCode())
                        + "\"");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setRows(1);

        QueryResponse response = solrClient.query(VOLUME_CORE_NAME, solrQuery);

        List<Volume> volumeList = response.getBeans(Volume.class);

        if (!volumeList.isEmpty()) {
            if (!volumeList.getFirst().getId().equals(volumeDTO.getId())) {
                throw new RuntimeException(
                        "Volume with barcode " + volumeDTO.getBarCode() + " already exists");
            }
        }

        try {
            volumeDTO.preUpdate();

            Volume volume = volumeMapper.toModel(volumeDTO);
            resolveVolumeReferenceNames(volume, volumeDTO);

            solrClient.addBean(VOLUME_CORE_NAME, volume);
            solrClient.commit(VOLUME_CORE_NAME);
            logger.info("volume {} successfully updated", volumeDTO.getId());
        } catch (Exception e) {
            throw new RuntimeException("Failed to update volume", e);
        }
    }

    private void resolveVolumeReferenceNames(Volume volume, VolumeDTO volumeDTO)
            throws SolrServerException, IOException {
        MetaTitle metaTitle = referenceDataService.resolveMetaTitle(volumeDTO.getMetaTitleId());
        volume.setMetaTitleName(metaTitle.getName());

        Mutation mutation = referenceDataService.resolveMutation(volumeDTO.getMutationId());
        volume.setMutationCsName(mutation.getNameCs());
        volume.setMutationSkName(mutation.getNameSk());
        volume.setMutationEnName(mutation.getNameEn());

        Owner owner = referenceDataService.resolveOwner(volumeDTO.getOwnerId());
        volume.setOwnerName(owner.getName());
        volume.setOwnerShorthand(owner.getShorthand());
        volume.setOwnerSigla(owner.getSigla());
    }

    private void deleteVolume(Volume volume) {
        try {
            volume.preRemove();

            solrClient.addBean(VOLUME_CORE_NAME, volume);
            solrClient.commit(VOLUME_CORE_NAME);
            logger.info("volume {} successfully deleted", volume.getId());
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete volume", e);
        }
    }

    public String createVolumeWithSpecimens(
            EditableVolumeWithSpecimensDTO editableVolumeWithSpecimensDTO)
            throws SolrServerException, IOException {
        ownerAuthorization.requireAccess(editableVolumeWithSpecimensDTO.volume().getOwnerId());
        specimenService.validateDamageTypes(editableVolumeWithSpecimensDTO.specimens());
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(
                BAR_CODE_FIELD
                        + ":\""
                        + ClientUtils.escapeQueryChars(
                                editableVolumeWithSpecimensDTO.volume().getBarCode())
                        + "\"");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setRows(1);

        QueryResponse response = solrClient.query(VOLUME_CORE_NAME, solrQuery);

        List<Volume> volumeList = response.getBeans(Volume.class);

        if (!volumeList.isEmpty()) {
            throw new RuntimeException(
                    "Volume with barcode "
                            + editableVolumeWithSpecimensDTO.volume().getBarCode()
                            + " already exists");
        }

        validateVolumeDateRange(
                editableVolumeWithSpecimensDTO.volume().getId(), editableVolumeWithSpecimensDTO);
        createVolume(editableVolumeWithSpecimensDTO.volume());

        specimenService.createSpecimens(editableVolumeWithSpecimensDTO.specimens());

        return "\"" + editableVolumeWithSpecimensDTO.volume().getId() + "\"";
    }

    public void updateVolumeWithSpecimens(
            String volumeId, EditableVolumeWithSpecimensDTO editableVolumeWithSpecimensDTO)
            throws SolrServerException, IOException {
        Volume existing = checkVolumeExistsById(volumeId);
        requireUpdateAccess(volumeId, editableVolumeWithSpecimensDTO, existing);
        specimenService.validateDamageTypes(editableVolumeWithSpecimensDTO.specimens());

        List<SpecimenDTO> activeSpecimens =
                validateVolumeDateRange(volumeId, editableVolumeWithSpecimensDTO);
        updateVolume(editableVolumeWithSpecimensDTO.volume());

        specimenService.updateSpecimens(editableVolumeWithSpecimensDTO.specimens());
        List<SpecimenDTO> unnumberedSpecimensOutsideDateRange =
                activeSpecimens.stream()
                        .filter(specimen -> !Boolean.TRUE.equals(specimen.getNumExists()))
                        .filter(
                                specimen ->
                                        isOutsideDateRange(
                                                specimen.getPublicationDate(),
                                                editableVolumeWithSpecimensDTO.volume()))
                        .toList();
        if (!unnumberedSpecimensOutsideDateRange.isEmpty()) {
            specimenService.deleteSpecimens(unnumberedSpecimensOutsideDateRange);
        }
    }

    public void updateOvergeneratedVolumeWithSpecimens(
            String volumeId, EditableVolumeWithSpecimensDTO editableVolumeWithSpecimensDTO)
            throws SolrServerException, IOException {
        Volume existing = checkVolumeExistsById(volumeId);
        requireUpdateAccess(volumeId, editableVolumeWithSpecimensDTO, existing);
        specimenService.validateDamageTypes(editableVolumeWithSpecimensDTO.specimens());

        validateVolumeDateRange(volumeId, editableVolumeWithSpecimensDTO);

        // delete old specimens
        List<SpecimenDTO> oldSpecimens =
                specimenService.getSpecimensForVolumeDetail(volumeId, false);
        specimenService.deleteSpecimens(oldSpecimens);

        updateVolume(editableVolumeWithSpecimensDTO.volume());

        specimenService.createSpecimens(editableVolumeWithSpecimensDTO.specimens());
    }

    public void deleteVolumeWithSpecimens(String volumeId) throws SolrServerException, IOException {
        Volume volume = checkVolumeExistsById(volumeId);
        ownerAuthorization.requireAccess(volume.getOwnerId());

        List<SpecimenDTO> specimens = specimenService.getSpecimensForVolumeDetail(volumeId, false);
        specimenService.deleteSpecimens(specimens);

        deleteVolume(volume);
    }

    private List<SpecimenDTO> validateVolumeDateRange(
            String volumeId, EditableVolumeWithSpecimensDTO editableVolumeWithSpecimensDTO)
            throws SolrServerException, IOException {
        LocalDate dateFrom = toUtcLocalDate(editableVolumeWithSpecimensDTO.volume().getDateFrom());
        LocalDate dateTo = toUtcLocalDate(editableVolumeWithSpecimensDTO.volume().getDateTo());
        if (dateFrom == null || dateTo == null || dateFrom.isAfter(dateTo)) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY, "VOLUME_DATE_RANGE_EXCLUDES_ACTIVE_SPECIMEN");
        }

        List<SpecimenDTO> activeSpecimens =
                specimenService.getSpecimensForVolumeDetail(volumeId, false);
        Set<String> payloadSpecimenIds =
                editableVolumeWithSpecimensDTO.specimens().stream()
                        .map(SpecimenDTO::getId)
                        .collect(Collectors.toSet());
        boolean excludesActiveSpecimen =
                Stream.concat(
                                activeSpecimens.stream()
                                        .filter(
                                                specimen ->
                                                        Boolean.TRUE.equals(specimen.getNumExists())
                                                                && !payloadSpecimenIds.contains(
                                                                        specimen.getId())),
                                editableVolumeWithSpecimensDTO.specimens().stream()
                                        .filter(
                                                specimen ->
                                                        Boolean.TRUE.equals(specimen.getNumExists())
                                                                && specimen.getDeleted() == null))
                        .map(SpecimenDTO::getPublicationDate)
                        .map(this::toUtcLocalDate)
                        .anyMatch(
                                publicationDate ->
                                        publicationDate == null
                                                || publicationDate.isBefore(dateFrom)
                                                || publicationDate.isAfter(dateTo));

        if (excludesActiveSpecimen) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY, "VOLUME_DATE_RANGE_EXCLUDES_ACTIVE_SPECIMEN");
        }

        return activeSpecimens;
    }

    private boolean isOutsideDateRange(java.util.Date publicationDate, VolumeDTO volume) {
        LocalDate date = toUtcLocalDate(publicationDate);
        LocalDate dateFrom = toUtcLocalDate(volume.getDateFrom());
        LocalDate dateTo = toUtcLocalDate(volume.getDateTo());
        return date == null || date.isBefore(dateFrom) || date.isAfter(dateTo);
    }

    private LocalDate toUtcLocalDate(java.util.Date date) {
        return date == null ? null : date.toInstant().atZone(ZoneOffset.UTC).toLocalDate();
    }

    private void requireUpdateAccess(
            String volumeId, EditableVolumeWithSpecimensDTO payload, Volume existing) {
        if (!Objects.equals(volumeId, payload.volume().getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Path and payload volume IDs differ");
        }
        ownerAuthorization.requireAccess(existing.getOwnerId());
        ownerAuthorization.requireAccess(payload.volume().getOwnerId());
    }
}
