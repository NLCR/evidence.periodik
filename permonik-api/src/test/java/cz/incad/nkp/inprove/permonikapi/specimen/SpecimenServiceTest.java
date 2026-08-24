package cz.incad.nkp.inprove.permonikapi.specimen;

import cz.incad.nkp.inprove.permonikapi.AbstractSolrIntegrationTest;
import cz.incad.nkp.inprove.permonikapi.audit.AuditableDefinition;
import cz.incad.nkp.inprove.permonikapi.specimen.dto.NamesDTO;
import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDefinition;
import cz.incad.nkp.inprove.permonikapi.support.SolrFixtureFactory;
import cz.incad.nkp.inprove.permonikapi.support.SolrTestSupport;
import cz.incad.nkp.inprove.permonikapi.support.TestSecuritySupport;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.request.SolrQuery;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Date;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class SpecimenServiceTest extends AbstractSolrIntegrationTest {

    @Autowired
    SpecimenService specimenService;

    @Autowired
    SolrClient solrClient;

    @BeforeEach
    void setUp() throws Exception {
        SolrTestSupport.clearCores(solrClient, SpecimenDefinition.SPECIMEN_CORE_NAME);
        TestSecuritySupport.setAuthenticationContext();
    }

    @AfterEach
    void tearDown() {
        TestSecuritySupport.clearAuthenticationContext();
    }

    @Test
        // Verifies pdate stats return the oldest publication date for meta title.
    void getSpecimensStartDate_returnsMinDate() throws Exception {
        Date newer = new Date(System.currentTimeMillis());
        Date older = new Date(System.currentTimeMillis() - 86_400_000L);
        String metaTitleId = SolrFixtureFactory.LISTING_META_TITLE_ID;

        solrClient.add(SpecimenDefinition.SPECIMEN_CORE_NAME, SolrFixtureFactory.specimenForListing(UUID.randomUUID().toString(), metaTitleId, older, "NameA", "SubA", true));
        solrClient.add(SpecimenDefinition.SPECIMEN_CORE_NAME, SolrFixtureFactory.specimenForListing(UUID.randomUUID().toString(), metaTitleId, newer, "NameB", "SubB", true));
        solrClient.commit(SpecimenDefinition.SPECIMEN_CORE_NAME);

        Object minDate = specimenService.getSpecimensStartDate(metaTitleId);

        assertThat(minDate).isEqualTo(older);
    }

    @Test
        // Verifies names/subNames endpoint returns distinct values across documents.
    void getSpecimenNamesAndSubNames_returnsDistinctValues() throws Exception {
        Date now = new Date();
        solrClient.add(SpecimenDefinition.SPECIMEN_CORE_NAME, SolrFixtureFactory.specimenForListing(UUID.randomUUID().toString(), SolrFixtureFactory.LISTING_META_TITLE_ID, now, "Morning", "A", true));
        solrClient.add(SpecimenDefinition.SPECIMEN_CORE_NAME, SolrFixtureFactory.specimenForListing(UUID.randomUUID().toString(), SolrFixtureFactory.LISTING_META_TITLE_ID, now, "Morning", "B", true));
        solrClient.add(SpecimenDefinition.SPECIMEN_CORE_NAME, SolrFixtureFactory.specimenForListing(UUID.randomUUID().toString(), SolrFixtureFactory.LISTING_META_TITLE_ID, now, "Evening", "B", true));
        solrClient.commit(SpecimenDefinition.SPECIMEN_CORE_NAME);

        NamesDTO names = specimenService.getSpecimenNamesAndSubNames();

        assertThat(names.names()).containsExactlyInAnyOrder("Morning", "Evening");
        assertThat(names.subNames()).containsExactlyInAnyOrder("A", "B");
    }

    @Test
        // Verifies delete operation is implemented as soft delete in Solr.
    void deleteSpecimenById_softDeletesSpecimen() throws Exception {
        String id = UUID.randomUUID().toString();
        solrClient.add(SpecimenDefinition.SPECIMEN_CORE_NAME, SolrFixtureFactory.specimenForListing(id, SolrFixtureFactory.LISTING_META_TITLE_ID, new Date(), "Name", "Sub", true));
        solrClient.commit(SpecimenDefinition.SPECIMEN_CORE_NAME);

        specimenService.deleteSpecimenById(id);

        var response = solrClient.query(
            SpecimenDefinition.SPECIMEN_CORE_NAME,
            new SolrQuery(SpecimenDefinition.ID_FIELD + ":\"" + id + "\"")
        );
        assertThat(response.getResults()).hasSize(1);
        assertThat(response.getResults().getFirst().getFieldValue(AuditableDefinition.DELETED_FIELD)).isNotNull();
    }

}
