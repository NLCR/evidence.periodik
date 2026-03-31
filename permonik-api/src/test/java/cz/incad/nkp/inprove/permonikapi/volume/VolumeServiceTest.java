package cz.incad.nkp.inprove.permonikapi.volume;

import cz.incad.nkp.inprove.permonikapi.AbstractSolrIntegrationTest;
import cz.incad.nkp.inprove.permonikapi.audit.AuditableDefinition;
import cz.incad.nkp.inprove.permonikapi.edition.model.EditionDefinition;
import cz.incad.nkp.inprove.permonikapi.metaTitle.MetaTitleDefinition;
import cz.incad.nkp.inprove.permonikapi.mutation.model.MutationDefinition;
import cz.incad.nkp.inprove.permonikapi.owner.OwnerDefinition;
import cz.incad.nkp.inprove.permonikapi.specimen.SpecimenService;
import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDefinition;
import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDTO;
import cz.incad.nkp.inprove.permonikapi.support.SolrFixtureFactory;
import cz.incad.nkp.inprove.permonikapi.support.SolrTestSupport;
import cz.incad.nkp.inprove.permonikapi.support.TestSecuritySupport;
import cz.incad.nkp.inprove.permonikapi.support.VolumeSpecimenDtoFactory;
import cz.incad.nkp.inprove.permonikapi.volume.dto.EditableVolumeWithSpecimensDTO;
import cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDTO;
import cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.request.SolrQuery;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class VolumeServiceTest extends AbstractSolrIntegrationTest {

    @Autowired
    VolumeService volumeService;

    @Autowired
    SolrClient solrClient;

    @Autowired
    SpecimenService specimenService;

    @BeforeEach
    void setUp() throws Exception {
        // Keep tests isolated by clearing touched cores before each scenario.
        SolrTestSupport.clearCores(
            solrClient,
            VolumeDefinition.VOLUME_CORE_NAME,
            SpecimenDefinition.SPECIMEN_CORE_NAME,
            MetaTitleDefinition.META_TITLE_CORE_NAME,
            MutationDefinition.MUTATION_CORE_NAME,
            OwnerDefinition.OWNER_CORE_NAME,
            EditionDefinition.EDITION_CORE_NAME
        );
        SolrFixtureFactory.seedDefaultReferenceData(solrClient);
        TestSecuritySupport.setAuthenticationContext();
    }

    @AfterEach
    void tearDown() {
        TestSecuritySupport.clearAuthenticationContext();
    }

    @Test
    // Verifies create flow writes both volume and specimen and resolves reference names.
    void createVolumeWithSpecimens_createsBothAndResolvesReferenceNames() throws Exception {
        String volumeId = UUID.randomUUID().toString();
        String specimenId = UUID.randomUUID().toString();
        EditableVolumeWithSpecimensDTO dto = VolumeSpecimenDtoFactory.editableVolume(
            volumeId,
            "BAR-CREATE",
            List.of(VolumeSpecimenDtoFactory.specimenDto(specimenId, volumeId, "N1"))
        );

        volumeService.createVolumeWithSpecimens(dto);

        var volumeResult = solrClient.query(VolumeDefinition.VOLUME_CORE_NAME, new SolrQuery(VolumeDefinition.ID_FIELD + ":\"" + volumeId + "\""));
        assertThat(volumeResult.getResults()).hasSize(1);
        assertThat(volumeResult.getResults().getFirst().getFieldValue(VolumeDefinition.OWNER_NAME_FIELD)).isEqualTo("Owner Name");
        assertThat(volumeResult.getResults().getFirst().getFieldValue(VolumeDefinition.MUTATION_CS_NAME_FIELD)).isEqualTo("Mutation CS");
        assertThat(volumeResult.getResults().getFirst().getFieldValue(VolumeDefinition.META_TITLE_NAME_FIELD)).isEqualTo("Meta Title");

        var specimenResult = solrClient.query(SpecimenDefinition.SPECIMEN_CORE_NAME, new SolrQuery(SpecimenDefinition.ID_FIELD + ":\"" + specimenId + "\""));
        assertThat(specimenResult.getResults()).hasSize(1);
        assertThat(specimenResult.getResults().getFirst().getFieldValue(SpecimenDefinition.OWNER_NAME_FIELD)).isEqualTo("Owner Name");
    }

    @Test
    // Verifies update flow persists changes on volume and existing specimen rows.
    void updateVolumeWithSpecimens_updatesVolumeAndSpecimens() throws Exception {
        String volumeId = UUID.randomUUID().toString();
        String specimenId = UUID.randomUUID().toString();
        volumeService.createVolumeWithSpecimens(
            VolumeSpecimenDtoFactory.editableVolume(
                volumeId,
                "BAR-ORIG",
                List.of(VolumeSpecimenDtoFactory.specimenDto(specimenId, volumeId, "Before"))
            )
        );

        VolumeDTO existingVolume = volumeService.getVolumeDTOById(volumeId);
        existingVolume.setBarCode("BAR-UPDATED");
        List<SpecimenDTO> existingSpecimens = specimenService.getSpecimensForVolumeDetail(volumeId, false);
        SpecimenDTO updatedSpecimen = existingSpecimens.getFirst();
        updatedSpecimen.setName("After");
        EditableVolumeWithSpecimensDTO updated = new EditableVolumeWithSpecimensDTO(existingVolume, List.of(updatedSpecimen));
        volumeService.updateVolumeWithSpecimens(volumeId, updated);

        var volumeResult = solrClient.query(VolumeDefinition.VOLUME_CORE_NAME, new SolrQuery(VolumeDefinition.ID_FIELD + ":\"" + volumeId + "\""));
        assertThat(volumeResult.getResults().getFirst().getFieldValue(VolumeDefinition.BAR_CODE_FIELD)).isEqualTo("BAR-UPDATED");

        var specimenResult = solrClient.query(SpecimenDefinition.SPECIMEN_CORE_NAME, new SolrQuery(SpecimenDefinition.ID_FIELD + ":\"" + specimenId + "\""));
        assertThat(specimenResult.getResults().getFirst().getFieldValue(SpecimenDefinition.NAME_FIELD)).isEqualTo("After");
    }

    @Test
    // Verifies overgenerated update replaces active specimen set with new payload.
    void updateOvergeneratedVolumeWithSpecimens_replacesSpecimens() throws Exception {
        String volumeId = UUID.randomUUID().toString();
        String old1 = UUID.randomUUID().toString();
        String old2 = UUID.randomUUID().toString();
        volumeService.createVolumeWithSpecimens(
            VolumeSpecimenDtoFactory.editableVolume(
                volumeId,
                "BAR-OVER",
                List.of(
                    VolumeSpecimenDtoFactory.specimenDto(old1, volumeId, "Old1"),
                    VolumeSpecimenDtoFactory.specimenDto(old2, volumeId, "Old2")
                )
            )
        );

        VolumeDTO existingVolume = volumeService.getVolumeDTOById(volumeId);
        String newer = UUID.randomUUID().toString();
        EditableVolumeWithSpecimensDTO updated = new EditableVolumeWithSpecimensDTO(
            existingVolume,
            List.of(VolumeSpecimenDtoFactory.specimenDto(newer, volumeId, "New"))
        );
        volumeService.updateOvergeneratedVolumeWithSpecimens(volumeId, updated);

        var activeSpecimens = solrClient.query(
            SpecimenDefinition.SPECIMEN_CORE_NAME,
            new SolrQuery(SpecimenDefinition.VOLUME_ID_FIELD + ":\"" + volumeId + "\" AND -" + AuditableDefinition.DELETED_FIELD + ":[* TO *]")
        );
        assertThat(activeSpecimens.getResults()).hasSize(1);
        assertThat(activeSpecimens.getResults().getFirst().getFieldValue(SpecimenDefinition.ID_FIELD)).isEqualTo(newer);
    }

    @Test
    // Verifies delete flow soft-deletes volume and all linked specimens.
    void deleteVolumeWithSpecimens_softDeletesVolumeAndAllSpecimens() throws Exception {
        String volumeId = UUID.randomUUID().toString();
        String specimenId = UUID.randomUUID().toString();
        volumeService.createVolumeWithSpecimens(
            VolumeSpecimenDtoFactory.editableVolume(
                volumeId,
                "BAR-DEL",
                List.of(VolumeSpecimenDtoFactory.specimenDto(specimenId, volumeId, "ToDelete"))
            )
        );

        volumeService.deleteVolumeWithSpecimens(volumeId);

        var volumeResult = solrClient.query(VolumeDefinition.VOLUME_CORE_NAME, new SolrQuery(VolumeDefinition.ID_FIELD + ":\"" + volumeId + "\""));
        assertThat(volumeResult.getResults()).hasSize(1);
        assertThat(volumeResult.getResults().getFirst().getFieldValue(AuditableDefinition.DELETED_FIELD)).isNotNull();

        var specimenResult = solrClient.query(SpecimenDefinition.SPECIMEN_CORE_NAME, new SolrQuery(SpecimenDefinition.ID_FIELD + ":\"" + specimenId + "\""));
        assertThat(specimenResult.getResults()).hasSize(1);
        assertThat(specimenResult.getResults().getFirst().getFieldValue(AuditableDefinition.DELETED_FIELD)).isNotNull();
    }

}
