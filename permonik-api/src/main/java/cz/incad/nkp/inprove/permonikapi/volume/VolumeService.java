package cz.incad.nkp.inprove.permonikapi.volume;

import cz.incad.nkp.inprove.permonikapi.metaTitle.MetaTitle;
import cz.incad.nkp.inprove.permonikapi.metaTitle.MetaTitleService;
import cz.incad.nkp.inprove.permonikapi.specimen.SpecimenService;
import cz.incad.nkp.inprove.permonikapi.specimen.dto.SpecimensForVolumeOverviewStatsDTO;
import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDTO;
import cz.incad.nkp.inprove.permonikapi.volume.dto.EditableVolumeWithSpecimensDTO;
import cz.incad.nkp.inprove.permonikapi.volume.dto.VolumeDetailDTO;
import cz.incad.nkp.inprove.permonikapi.volume.dto.VolumeOverviewStatsDTO;
import cz.incad.nkp.inprove.permonikapi.volume.model.Volume;
import cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDTO;
import cz.incad.nkp.inprove.permonikapi.volume.model.VolumeMapper;
import lombok.RequiredArgsConstructor;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

import static cz.incad.nkp.inprove.permonikapi.audit.AuditableDefinition.DELETED_FIELD;

@Service
@RequiredArgsConstructor
public class VolumeService implements VolumeDefinition {

    private static final Logger logger = LoggerFactory.getLogger(VolumeService.class);

    private final MetaTitleService metaTitleService;
    private final SpecimenService specimenService;
    private final SolrClient solrClient;
    private final VolumeMapper volumeMapper;


    public VolumeDTO getVolumeDTOById(String volumeId) throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(ID_FIELD + ":\"" + volumeId + "\"");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setRows(1);
        QueryResponse response = solrClient.query(VOLUME_CORE_NAME, solrQuery);

        List<Volume> volumeList = response.getBeans(Volume.class);

        if (volumeList.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        Volume volume = volumeList.getFirst();

        // Check metaTitle for not logged-in user. If a user is not logged in and metaTitle isn't public, throw an error
        metaTitleService.getMetaTitleById(volume.getMetaTitleId());


        return volumeMapper.toDTO(volumeList.getFirst());
    }

    public Volume checkVolumeExistsById(String volumeId) throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(ID_FIELD + ":\"" + volumeId + "\"");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setRows(1);

        QueryResponse response = solrClient.query(VOLUME_CORE_NAME, solrQuery);

        List<Volume> volumeList = response.getBeans(Volume.class);

        if (volumeList.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        return volumeList.getFirst();
    }


    public VolumeDetailDTO getVolumeDetailById(String volumeId, Boolean onlyPublic) throws SolrServerException, IOException {

        VolumeDTO volumeDTO = getVolumeDTOById(volumeId);

        try {
            List<SpecimenDTO> specimenList = specimenService.getSpecimensForVolumeDetail(volumeDTO.getId(), onlyPublic, volumeDTO.getShowAttachmentsAtTheEnd());

            return new VolumeDetailDTO(
                volumeDTO,
                specimenList
            );
        } catch (SolrServerException | IOException e) {
            throw new RuntimeException(e);
        }
    }

    public VolumeOverviewStatsDTO getVolumeOverviewStats(String volumeId) throws SolrServerException, IOException {

        VolumeDTO volumeDTO = getVolumeDTOById(volumeId);

        MetaTitle metaTitle = metaTitleService.getMetaTitleById(volumeDTO.getMetaTitleId());


        SpecimensForVolumeOverviewStatsDTO specimensForVolumeOverview = specimenService.getSpecimensForVolumeOverviewStats(volumeId);

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
            specimensForVolumeOverview.specimens()
        );

    }

    private void createVolume(VolumeDTO volumeDTO) {
        try {
            volumeDTO.prePersist();


            solrClient.addBean(VOLUME_CORE_NAME, volumeMapper.toModel(volumeDTO));
            solrClient.commit(VOLUME_CORE_NAME);
            logger.info("volume {} successfully created", volumeDTO.getId());
        } catch (Exception e) {
            throw new RuntimeException("Failed to create volume", e);
        }
    }

    private void updateVolume(VolumeDTO volumeDTO) throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(BAR_CODE_FIELD + ":\"" + volumeDTO.getBarCode() + "\"");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setRows(1);

        QueryResponse response = solrClient.query(VOLUME_CORE_NAME, solrQuery);

        List<Volume> volumeList = response.getBeans(Volume.class);

        if (!volumeList.isEmpty()) {
            if (!volumeList.getFirst().getId().equals(volumeDTO.getId())) {
                throw new RuntimeException("Volume with barcode " + volumeDTO.getBarCode() + " already exists");
            }
        }

        try {
            volumeDTO.preUpdate();

            solrClient.addBean(VOLUME_CORE_NAME, volumeMapper.toModel(volumeDTO));
            solrClient.commit(VOLUME_CORE_NAME);
            logger.info("volume {} successfully updated", volumeDTO.getId());
        } catch (Exception e) {
            throw new RuntimeException("Failed to update volume", e);
        }
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

    public String createVolumeWithSpecimens(EditableVolumeWithSpecimensDTO editableVolumeWithSpecimensDTO) throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(BAR_CODE_FIELD + ":\"" + editableVolumeWithSpecimensDTO.volume().getBarCode() + "\"");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setRows(1);

        QueryResponse response = solrClient.query(VOLUME_CORE_NAME, solrQuery);

        List<Volume> volumeList = response.getBeans(Volume.class);

        if (!volumeList.isEmpty()) {
            throw new RuntimeException("Volume with barcode " + editableVolumeWithSpecimensDTO.volume().getBarCode() + " already exists");
        }

        createVolume(editableVolumeWithSpecimensDTO.volume());

        specimenService.createSpecimens(editableVolumeWithSpecimensDTO.specimens());

        return "\"" + editableVolumeWithSpecimensDTO.volume().getId() + "\"";

    }


    public void updateVolumeWithSpecimens(String volumeId, EditableVolumeWithSpecimensDTO editableVolumeWithSpecimensDTO) throws SolrServerException, IOException {
        checkVolumeExistsById(volumeId);

        updateVolume(editableVolumeWithSpecimensDTO.volume());

        specimenService.updateSpecimens(editableVolumeWithSpecimensDTO.specimens());

    }

    public void updateOvergeneratedVolumeWithSpecimens(String volumeId, EditableVolumeWithSpecimensDTO editableVolumeWithSpecimensDTO) throws SolrServerException, IOException {
        if (getVolumeDTOById(volumeId) == null) {
            throw new RuntimeException("Volume " + volumeId + " not found");
        }

        // delete old specimens
        List<SpecimenDTO> oldSpecimens = specimenService.getSpecimensForVolumeDetail(volumeId, false);
        specimenService.deleteSpecimens(oldSpecimens);

        updateVolume(editableVolumeWithSpecimensDTO.volume());

        specimenService.createSpecimens(editableVolumeWithSpecimensDTO.specimens());

    }

    public void deleteVolumeWithSpecimens(String volumeId) throws SolrServerException, IOException {
        Volume volume = checkVolumeExistsById(volumeId);

        List<SpecimenDTO> specimens = specimenService.getSpecimensForVolumeDetail(volumeId, false);
        specimenService.deleteSpecimens(specimens);

        deleteVolume(volume);

    }
}
