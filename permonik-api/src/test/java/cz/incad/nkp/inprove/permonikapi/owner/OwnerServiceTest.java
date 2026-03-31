package cz.incad.nkp.inprove.permonikapi.owner;

import cz.incad.nkp.inprove.permonikapi.AbstractSolrIntegrationTest;
import cz.incad.nkp.inprove.permonikapi.owner.dto.CreatableOwnerDTO;
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

class OwnerServiceTest extends AbstractSolrIntegrationTest {

    @Autowired
    OwnerService ownerService;

    @Autowired
    SolrClient solrClient;

    @BeforeEach
    void setUp() throws Exception {
        SolrTestSupport.clearCores(
            solrClient,
            OwnerDefinition.OWNER_CORE_NAME,
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
    // Verifies soft-deleted owners are filtered out from listing.
    void getOwners_returnsOnlyNonDeleted() throws Exception {
        ownerService.createOwner(new CreatableOwnerDTO("Active Library", "ACT", "ACT001"));
        ownerService.createOwner(new CreatableOwnerDTO("Another Library", "ANT", "ANT001"));
        ownerService.createOwner(new CreatableOwnerDTO("Deleted Library", "DEL", "DEL001"));

        List<Owner> persisted = solrClient
            .query(OwnerDefinition.OWNER_CORE_NAME, new SolrQuery("*:*"))
            .getBeans(Owner.class);
        Owner deleted = persisted.stream().filter(owner -> owner.getName().equals("Deleted Library")).findFirst().orElseThrow();
        deleted.setDeleted(new Date());
        deleted.setDeletedBy(TestSecuritySupport.TEST_USER_ID);
        solrClient.addBean(OwnerDefinition.OWNER_CORE_NAME, deleted);
        solrClient.commit(OwnerDefinition.OWNER_CORE_NAME);

        List<Owner> owners = ownerService.getOwners();
        assertThat(owners).hasSize(2);
        assertThat(owners).extracting(Owner::getName)
                .containsExactlyInAnyOrder("Active Library", "Another Library");
    }

    @Test
    // Verifies create operation persists owner fields in Solr.
    void createOwner_persistsToSolr() throws Exception {
        ownerService.createOwner(new CreatableOwnerDTO("Test Library", "TST", "TST001"));

        List<Owner> owners = ownerService.getOwners();

        assertThat(owners).hasSize(1);
        assertThat(owners.getFirst().getName()).isEqualTo("Test Library");
        assertThat(owners.getFirst().getShorthand()).isEqualTo("TST");
        assertThat(owners.getFirst().getSigla()).isEqualTo("TST001");
    }

    @Test
    // Verifies uniqueness check rejects duplicated shorthand.
    void createOwner_rejectsDuplicateShorthand() throws Exception {
        ownerService.createOwner(new CreatableOwnerDTO("First Library", "DUP", "DUP001"));

        assertThatThrownBy(() ->
                ownerService.createOwner(new CreatableOwnerDTO("Second Library", "DUP", "DUP002")))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    // Verifies uniqueness check rejects duplicated sigla.
    void createOwner_rejectsDuplicateSigla() throws Exception {
        ownerService.createOwner(new CreatableOwnerDTO("First Library", "FIR", "SIG001"));

        assertThatThrownBy(() ->
                ownerService.createOwner(new CreatableOwnerDTO("Second Library", "SEC", "SIG001")))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    // Verifies update operation writes changed owner fields.
    void updateOwner_updatesFieldsInSolr() throws Exception {
        ownerService.createOwner(new CreatableOwnerDTO("Original Name", "ORG", "ORG001"));
        // Fetch the full persisted owner (includes required audit fields created/created_by)
        Owner existing = ownerService.getOwners().getFirst();

        existing.setName("Updated Name");
        existing.setShorthand("UPD");
        existing.setSigla("UPD001");
        ownerService.updateOwner(existing.getId(), existing);

        Owner result = ownerService.getOwners().getFirst();
        assertThat(result.getName()).isEqualTo("Updated Name");
        assertThat(result.getShorthand()).isEqualTo("UPD");
    }

    @Test
    // Verifies owner rename is denormalized to volume/specimen cores.
    void updateOwner_propagatesToVolumesAndSpecimens() throws Exception {
        ownerService.createOwner(new CreatableOwnerDTO("Original Name", "ORG", "ORG001"));
        Owner existing = ownerService.getOwners().getFirst();

        String volumeId = UUID.randomUUID().toString();
        SolrInputDocument volumeDoc = SolrFixtureFactory.volumeForOwner(volumeId, existing.getId(), existing.getName(), existing.getShorthand(), existing.getSigla());
        solrClient.add(VolumeDefinition.VOLUME_CORE_NAME, volumeDoc);
        solrClient.commit(VolumeDefinition.VOLUME_CORE_NAME);

        String specimenId = UUID.randomUUID().toString();
        SolrInputDocument specimenDoc = SolrFixtureFactory.specimenForOwner(specimenId, existing.getId(), existing.getName(), existing.getShorthand(), existing.getSigla());
        solrClient.add(SpecimenDefinition.SPECIMEN_CORE_NAME, specimenDoc);
        solrClient.commit(SpecimenDefinition.SPECIMEN_CORE_NAME);

        existing.setName("Updated Name");
        existing.setShorthand("UPD");
        existing.setSigla("UPD001");
        ownerService.updateOwner(existing.getId(), existing);

        var volumeResponse = solrClient.query(
            VolumeDefinition.VOLUME_CORE_NAME,
            new SolrQuery(VolumeDefinition.ID_FIELD + ":\"" + volumeId + "\"")
        );
        assertThat(volumeResponse.getResults()).hasSize(1);
        assertThat(volumeResponse.getResults().getFirst().getFieldValue(VolumeDefinition.OWNER_NAME_FIELD)).isEqualTo("Updated Name");
        assertThat(volumeResponse.getResults().getFirst().getFieldValue(VolumeDefinition.OWNER_SHORTHAND_FIELD)).isEqualTo("UPD");
        assertThat(volumeResponse.getResults().getFirst().getFieldValue(VolumeDefinition.OWNER_SIGLA_FIELD)).isEqualTo("UPD001");

        var specimenResponse = solrClient.query(
            SpecimenDefinition.SPECIMEN_CORE_NAME,
            new SolrQuery(SpecimenDefinition.ID_FIELD + ":\"" + specimenId + "\"")
        );
        assertThat(specimenResponse.getResults()).hasSize(1);
        assertThat(specimenResponse.getResults().getFirst().getFieldValue(SpecimenDefinition.OWNER_NAME_FIELD)).isEqualTo("Updated Name");
        assertThat(specimenResponse.getResults().getFirst().getFieldValue(SpecimenDefinition.OWNER_SHORTHAND_FIELD)).isEqualTo("UPD");
        assertThat(specimenResponse.getResults().getFirst().getFieldValue(SpecimenDefinition.OWNER_SIGLA_FIELD)).isEqualTo("UPD001");
    }

    @Test
    // Verifies update fails with not-found for unknown owner id.
    void updateOwner_throwsWhenNotFound() {
        String nonExistentId = UUID.randomUUID().toString();
        Owner owner = new Owner();
        owner.setId(nonExistentId);
        owner.setName("Name");

        assertThatThrownBy(() -> ownerService.updateOwner(nonExistentId, owner))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }

}
