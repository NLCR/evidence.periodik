package cz.incad.nkp.inprove.permonikapi.edition;

import cz.incad.nkp.inprove.permonikapi.AbstractSolrIntegrationTest;
import cz.incad.nkp.inprove.permonikapi.edition.dto.EditionNameDTO;
import cz.incad.nkp.inprove.permonikapi.edition.model.Edition;
import cz.incad.nkp.inprove.permonikapi.edition.model.EditionDTO;
import cz.incad.nkp.inprove.permonikapi.edition.model.EditionDefinition;
import cz.incad.nkp.inprove.permonikapi.support.SolrFixtureFactory;
import cz.incad.nkp.inprove.permonikapi.support.SolrTestSupport;
import cz.incad.nkp.inprove.permonikapi.support.TestSecuritySupport;
import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDefinition;
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

class EditionServiceTest extends AbstractSolrIntegrationTest {

    @Autowired
    EditionService editionService;

    @Autowired
    SolrClient solrClient;

    @BeforeEach
    void setUp() throws Exception {
        SolrTestSupport.clearCores(
            solrClient,
            EditionDefinition.EDITION_CORE_NAME,
            SpecimenDefinition.SPECIMEN_CORE_NAME
        );
        TestSecuritySupport.setAuthenticationContext();
    }

    @AfterEach
    void tearDown() {
        TestSecuritySupport.clearAuthenticationContext();
    }

    @Test
    // Verifies soft-deleted editions are filtered out from listing.
    void getEditions_returnsOnlyNonDeleted() throws Exception {
        editionService.createEdition(editionDto("Active", "Active", "Active", true, false, false));
        editionService.createEdition(editionDto("Another", "Another", "Another", false, false, false));
        editionService.createEdition(editionDto("Deleted", "Deleted", "Deleted", false, false, false));

        List<Edition> persisted = solrClient.query(EditionDefinition.EDITION_CORE_NAME, new SolrQuery("*:*")).getBeans(Edition.class);
        Edition deleted = persisted.stream().filter(edition -> edition.getNameCs().equals("Deleted")).findFirst().orElseThrow();
        deleted.setDeleted(new Date());
        deleted.setDeletedBy(TestSecuritySupport.TEST_USER_ID);
        solrClient.addBean(EditionDefinition.EDITION_CORE_NAME, deleted);
        solrClient.commit(EditionDefinition.EDITION_CORE_NAME);

        List<EditionDTO> editions = editionService.getEditions("cs");
        assertThat(editions).hasSize(2);
        assertThat(editions).extracting(edition -> edition.getName().cs()).containsExactlyInAnyOrder("Active", "Another");
    }

    @Test
    // Verifies listing uses Czech sort field for locale-specific ordering.
    void getEditions_sortsByCzechLocaleField() throws Exception {
        editionService.createEdition(editionDto("Chata", "Chata", "Cottage", false, false, false));
        editionService.createEdition(editionDto("Hrad", "Hrad", "Castle", false, false, false));

        List<EditionDTO> editions = editionService.getEditions("cs");

        assertThat(editions).extracting(edition -> edition.getName().cs()).containsExactly("Hrad", "Chata");
    }

    @Test
    // Verifies explicit lang selects matching localized sort field.
    void getEditions_sortsByRequestedLanguageField() throws Exception {
        editionService.createEdition(editionDto("Zeta", "Alfa", "Zulu", false, false, false));
        editionService.createEdition(editionDto("Alfa", "Zeta", "Alpha", false, false, false));

        List<EditionDTO> editions = editionService.getEditions("sk");

        assertThat(editions).extracting(edition -> edition.getName().cs()).containsExactly("Zeta", "Alfa");
    }

    @Test
    // Verifies create operation persists multilingual edition names.
    void createEdition_persistsToSolr() throws Exception {
        editionService.createEdition(editionDto("Rano", "Rano", "Morning", true, false, false));

        List<EditionDTO> editions = editionService.getEditions("cs");

        assertThat(editions).hasSize(1);
        assertThat(editions.getFirst().getName().cs()).isEqualTo("Rano");
        assertThat(editions.getFirst().getName().sk()).isEqualTo("Rano");
        assertThat(editions.getFirst().getName().en()).isEqualTo("Morning");
    }

    @Test
    // Verifies uniqueness check rejects duplicated Czech edition name.
    void createEdition_rejectsDuplicateName() throws Exception {
        editionService.createEdition(editionDto("Duplicate", "Dup", "Dup", false, false, false));

        assertThatThrownBy(() -> editionService.createEdition(editionDto("Duplicate", "Other", "Other", false, false, false)))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("already exists");
    }

    @Test
    // Verifies update modifies names but keeps immutable flag semantics.
    void updateEdition_updatesNamesAndPreservesFlags() throws Exception {
        editionService.createEdition(editionDto("Original", "Original", "Original", true, true, false));
        EditionDTO existing = editionService.getEditions("cs").getFirst();

        existing.setName(new EditionNameDTO("Updated", "Upraveny", "Updated"));
        existing.setIsDefault(false);
        existing.setIsAttachment(false);
        existing.setIsPeriodicAttachment(true);

        editionService.updateEdition(existing.getId(), existing);

        EditionDTO result = editionService.getEditions("cs").getFirst();
        assertThat(result.getName().cs()).isEqualTo("Updated");
        assertThat(result.getName().sk()).isEqualTo("Upraveny");
        assertThat(result.getName().en()).isEqualTo("Updated");
        assertThat(result.getIsDefault()).isTrue();
        assertThat(result.getIsAttachment()).isTrue();
        assertThat(result.getIsPeriodicAttachment()).isFalse();
    }

    @Test
    // Verifies edition rename is denormalized to specimen core.
    void updateEdition_propagatesToSpecimens() throws Exception {
        editionService.createEdition(editionDto("Original", "Original", "Original", false, false, false));
        EditionDTO existing = editionService.getEditions("cs").getFirst();

        String specimenId = UUID.randomUUID().toString();
        SolrInputDocument specimenDoc = SolrFixtureFactory.specimenForEdition(
            specimenId,
            existing.getId(),
            existing.getName().cs(),
            existing.getName().sk(),
            existing.getName().en()
        );
        solrClient.add(SpecimenDefinition.SPECIMEN_CORE_NAME, specimenDoc);
        solrClient.commit(SpecimenDefinition.SPECIMEN_CORE_NAME);

        existing.setName(new EditionNameDTO("Updated", "Aktualizovane", "Updated"));
        editionService.updateEdition(existing.getId(), existing);

        var specimenResponse = solrClient.query(
            SpecimenDefinition.SPECIMEN_CORE_NAME,
            new SolrQuery(SpecimenDefinition.ID_FIELD + ":\"" + specimenId + "\"")
        );
        assertThat(specimenResponse.getResults()).hasSize(1);
        assertThat(specimenResponse.getResults().getFirst().getFieldValue(SpecimenDefinition.EDITION_CS_NAME_FIELD)).isEqualTo("Updated");
        assertThat(specimenResponse.getResults().getFirst().getFieldValue(SpecimenDefinition.EDITION_SK_NAME_FIELD)).isEqualTo("Aktualizovane");
        assertThat(specimenResponse.getResults().getFirst().getFieldValue(SpecimenDefinition.EDITION_EN_NAME_FIELD)).isEqualTo("Updated");
    }

    @Test
    // Verifies update fails with not-found for unknown edition id.
    void updateEdition_throwsWhenNotFound() {
        String nonExistentId = UUID.randomUUID().toString();
        EditionDTO edition = editionDto("Name", "Name", "Name", false, false, false);
        edition.setId(nonExistentId);

        assertThatThrownBy(() -> editionService.updateEdition(nonExistentId, edition))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("not found");
    }

    private static EditionDTO editionDto(
        String cs,
        String sk,
        String en,
        boolean isDefault,
        boolean isAttachment,
        boolean isPeriodicAttachment
    ) {
        EditionDTO dto = new EditionDTO();
        dto.setName(new EditionNameDTO(cs, sk, en));
        dto.setIsDefault(isDefault);
        dto.setIsAttachment(isAttachment);
        dto.setIsPeriodicAttachment(isPeriodicAttachment);
        return dto;
    }

}
