package cz.incad.nkp.inprove.permonikapi.mutation;

import cz.incad.nkp.inprove.permonikapi.AbstractSolrIntegrationTest;
import cz.incad.nkp.inprove.permonikapi.mutation.dto.MutationNameDTO;
import cz.incad.nkp.inprove.permonikapi.mutation.model.Mutation;
import cz.incad.nkp.inprove.permonikapi.mutation.model.MutationDTO;
import cz.incad.nkp.inprove.permonikapi.mutation.model.MutationDefinition;
import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDefinition;
import cz.incad.nkp.inprove.permonikapi.support.SolrFixtureFactory;
import cz.incad.nkp.inprove.permonikapi.support.SolrTestSupport;
import cz.incad.nkp.inprove.permonikapi.support.TestSecuritySupport;
import cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.request.SolrQuery;
import org.apache.solr.common.SolrInputDocument;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MutationServiceTest extends AbstractSolrIntegrationTest {

    @Autowired
    MutationService mutationService;

    @Autowired
    SolrClient solrClient;

    @BeforeEach
    void setUp() throws Exception {
        SolrTestSupport.clearCores(
            solrClient,
            MutationDefinition.MUTATION_CORE_NAME,
            VolumeDefinition.VOLUME_CORE_NAME,
            SpecimenDefinition.SPECIMEN_CORE_NAME
        );
        TestSecuritySupport.setAuthenticationContext();
    }

    @AfterEach
    void tearDown() {
        TestSecuritySupport.clearAuthenticationContext();
    }

    @Test
    // Verifies soft-deleted mutations are filtered out from listing.
    void getMutations_returnsOnlyNonDeleted() throws Exception {
        mutationService.createMutation(mutationDto("Active", "Active", "Active"));
        mutationService.createMutation(mutationDto("Another", "Another", "Another"));
        mutationService.createMutation(mutationDto("Deleted", "Deleted", "Deleted"));

        List<Mutation> persisted = solrClient.query(MutationDefinition.MUTATION_CORE_NAME, new SolrQuery("*:*")).getBeans(Mutation.class);
        Mutation deleted = persisted.stream().filter(mutation -> mutation.getNameCs().equals("Deleted")).findFirst().orElseThrow();
        deleted.setDeleted(new Date());
        deleted.setDeletedBy(TestSecuritySupport.TEST_USER_ID);
        solrClient.addBean(MutationDefinition.MUTATION_CORE_NAME, deleted);
        solrClient.commit(MutationDefinition.MUTATION_CORE_NAME);

        List<MutationDTO> mutations = mutationService.getMutations("cs");
        assertThat(mutations).hasSize(2);
        assertThat(mutations).extracting(mutation -> mutation.getName().cs()).containsExactlyInAnyOrder("Active", "Another");
    }

    @Test
    // Verifies listing uses Czech sort field for locale-specific ordering.
    void getMutations_sortsByCzechLocaleField() throws Exception {
        mutationService.createMutation(mutationDto("Chata", "Chata", "Cottage"));
        mutationService.createMutation(mutationDto("Hrad", "Hrad", "Castle"));

        List<MutationDTO> mutations = mutationService.getMutations("cs");

        assertThat(mutations).extracting(mutation -> mutation.getName().cs()).containsExactly("Hrad", "Chata");
    }

    @Test
    // Verifies explicit lang selects matching localized sort field.
    void getMutations_sortsByRequestedLanguageField() throws Exception {
        mutationService.createMutation(mutationDto("Zeta", "Alfa", "Zulu"));
        mutationService.createMutation(mutationDto("Alfa", "Zeta", "Alpha"));

        List<MutationDTO> mutations = mutationService.getMutations("en");

        assertThat(mutations).extracting(mutation -> mutation.getName().cs()).containsExactly("Alfa", "Zeta");
    }

    @Test
    // Verifies create operation persists multilingual mutation names.
    void createMutation_persistsToSolr() throws Exception {
        mutationService.createMutation(mutationDto("Rano", "Rano", "Morning"));

        List<MutationDTO> mutations = mutationService.getMutations("cs");

        assertThat(mutations).hasSize(1);
        assertThat(mutations.getFirst().getName().cs()).isEqualTo("Rano");
        assertThat(mutations.getFirst().getName().sk()).isEqualTo("Rano");
        assertThat(mutations.getFirst().getName().en()).isEqualTo("Morning");
    }

    @Test
    // Verifies uniqueness check rejects duplicated Czech mutation name.
    void createMutation_rejectsDuplicateName() throws Exception {
        mutationService.createMutation(mutationDto("Duplicate", "Dup", "Dup"));

        assertThatThrownBy(() -> mutationService.createMutation(mutationDto("Duplicate", "Other", "Other")))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("already exists");
    }

    @Test
    // Verifies update operation writes new multilingual names.
    void updateMutation_updatesFieldsInSolr() throws Exception {
        mutationService.createMutation(mutationDto("Original", "Original", "Original"));
        MutationDTO existing = mutationService.getMutations("cs").getFirst();

        existing.setName(new MutationNameDTO("Updated", "Upraveny", "Updated"));
        mutationService.updateMutation(existing.getId(), existing);

        MutationDTO result = mutationService.getMutations("cs").getFirst();
        assertThat(result.getName().cs()).isEqualTo("Updated");
        assertThat(result.getName().sk()).isEqualTo("Upraveny");
        assertThat(result.getName().en()).isEqualTo("Updated");
    }

    @Test
    // Verifies mutation rename is denormalized to volume/specimen cores.
    void updateMutation_propagatesToVolumesAndSpecimens() throws Exception {
        mutationService.createMutation(mutationDto("Original", "Original", "Original"));
        MutationDTO existing = mutationService.getMutations("cs").getFirst();

        String volumeId = UUID.randomUUID().toString();
        SolrInputDocument volumeDoc = SolrFixtureFactory.volumeForMutation(
            volumeId,
            existing.getId(),
            existing.getName().cs(),
            existing.getName().sk(),
            existing.getName().en()
        );
        solrClient.add(VolumeDefinition.VOLUME_CORE_NAME, volumeDoc);
        solrClient.commit(VolumeDefinition.VOLUME_CORE_NAME);

        String specimenId = UUID.randomUUID().toString();
        SolrInputDocument specimenDoc = SolrFixtureFactory.specimenForMutation(
            specimenId,
            existing.getId(),
            existing.getName().cs(),
            existing.getName().sk(),
            existing.getName().en()
        );
        solrClient.add(SpecimenDefinition.SPECIMEN_CORE_NAME, specimenDoc);
        solrClient.commit(SpecimenDefinition.SPECIMEN_CORE_NAME);

        existing.setName(new MutationNameDTO("Updated", "Aktualizovane", "Updated"));
        mutationService.updateMutation(existing.getId(), existing);

        var volumeResponse = solrClient.query(
            VolumeDefinition.VOLUME_CORE_NAME,
            new SolrQuery(VolumeDefinition.ID_FIELD + ":\"" + volumeId + "\"")
        );
        assertThat(volumeResponse.getResults()).hasSize(1);
        assertThat(volumeResponse.getResults().getFirst().getFieldValue(VolumeDefinition.MUTATION_CS_NAME_FIELD)).isEqualTo("Updated");
        assertThat(volumeResponse.getResults().getFirst().getFieldValue(VolumeDefinition.MUTATION_SK_NAME_FIELD)).isEqualTo("Aktualizovane");
        assertThat(volumeResponse.getResults().getFirst().getFieldValue(VolumeDefinition.MUTATION_EN_NAME_FIELD)).isEqualTo("Updated");

        var specimenResponse = solrClient.query(
            SpecimenDefinition.SPECIMEN_CORE_NAME,
            new SolrQuery(SpecimenDefinition.ID_FIELD + ":\"" + specimenId + "\"")
        );
        assertThat(specimenResponse.getResults()).hasSize(1);
        assertThat(specimenResponse.getResults().getFirst().getFieldValue(SpecimenDefinition.MUTATION_CS_NAME_FIELD)).isEqualTo("Updated");
        assertThat(specimenResponse.getResults().getFirst().getFieldValue(SpecimenDefinition.MUTATION_SK_NAME_FIELD)).isEqualTo("Aktualizovane");
        assertThat(specimenResponse.getResults().getFirst().getFieldValue(SpecimenDefinition.MUTATION_EN_NAME_FIELD)).isEqualTo("Updated");
    }

    @Test
    // Verifies update fails with not-found for unknown mutation id.
    void updateMutation_throwsWhenNotFound() {
        String nonExistentId = UUID.randomUUID().toString();
        MutationDTO mutation = mutationDto("Name", "Name", "Name");
        mutation.setId(nonExistentId);

        assertThatThrownBy(() -> mutationService.updateMutation(nonExistentId, mutation))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("not found");
    }

    private static MutationDTO mutationDto(String cs, String sk, String en) {
        MutationDTO dto = new MutationDTO();
        dto.setName(new MutationNameDTO(cs, sk, en));
        return dto;
    }

}
