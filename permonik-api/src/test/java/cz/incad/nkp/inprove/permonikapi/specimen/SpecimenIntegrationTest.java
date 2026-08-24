package cz.incad.nkp.inprove.permonikapi.specimen;

import com.fasterxml.jackson.databind.ObjectMapper;
import cz.incad.nkp.inprove.permonikapi.AbstractSolrIntegrationTest;
import cz.incad.nkp.inprove.permonikapi.support.SpecimenFacetsFactory;
import cz.incad.nkp.inprove.permonikapi.support.SolrFixtureFactory;
import cz.incad.nkp.inprove.permonikapi.support.SolrTestSupport;
import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDefinition;
import org.apache.solr.client.solrj.SolrClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Date;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SpecimenIntegrationTest extends AbstractSolrIntegrationTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    SolrClient solrClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() throws Exception {
        SolrTestSupport.clearCores(solrClient, SpecimenDefinition.SPECIMEN_CORE_NAME);

        // Shared fixture covers 2 visible records + 1 hidden record for filtering checks.
        String metaTitleId = SolrFixtureFactory.LISTING_META_TITLE_ID;
        solrClient.add(SpecimenDefinition.SPECIMEN_CORE_NAME, SolrFixtureFactory.specimenForListing(UUID.randomUUID().toString(), metaTitleId, new Date(System.currentTimeMillis() - 200_000L), "Morning", "A", true));
        solrClient.add(SpecimenDefinition.SPECIMEN_CORE_NAME, SolrFixtureFactory.specimenForListing(UUID.randomUUID().toString(), metaTitleId, new Date(System.currentTimeMillis() - 100_000L), "Evening", "B", true));
        solrClient.add(SpecimenDefinition.SPECIMEN_CORE_NAME, SolrFixtureFactory.specimenForListing(UUID.randomUUID().toString(), metaTitleId, new Date(System.currentTimeMillis()), "Hidden", "C", false));
        solrClient.commit(SpecimenDefinition.SPECIMEN_CORE_NAME);
    }

    @Test
    // Verifies list endpoint honors pagination and excludes numMissing-only records.
    void postList_returnsPaginatedOverview() throws Exception {
        String facets = facetsJson(SpecimenFacetsFactory.empty());

        mockMvc.perform(post("/api/specimen/" + SolrFixtureFactory.LISTING_META_TITLE_ID + "/list")
                .queryParam("offset", "0")
                .queryParam("rows", "1")
                .queryParam("facets", facets)
                .queryParam("view", "TABLE")
                .header("Accept-Language", "cs"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.specimens", hasSize(1)))
            .andExpect(jsonPath("$.count", is(2)));
    }

    @Test
    // Verifies facets endpoint returns aggregated facet buckets from current result set.
    void postListFacets_returnsFacetCounts() throws Exception {
        String facets = facetsJson(SpecimenFacetsFactory.empty());

        mockMvc.perform(post("/api/specimen/" + SolrFixtureFactory.LISTING_META_TITLE_ID + "/list/facets")
                .queryParam("facets", facets)
                .queryParam("view", "TABLE"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.names", hasSize(2)))
            .andExpect(jsonPath("$.subNames", hasSize(2)));
    }

    @Test
    // Verifies selected name facet narrows list results to matching specimens.
    void postList_withNameFacet_filtersResults() throws Exception {
        String facets = facetsJson(SpecimenFacetsFactory.withNames("Morning"));

        mockMvc.perform(post("/api/specimen/" + SolrFixtureFactory.LISTING_META_TITLE_ID + "/list")
                .queryParam("offset", "0")
                .queryParam("rows", "10")
                .queryParam("facets", facets)
                .queryParam("view", "TABLE")
                .header("Accept-Language", "cs"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.specimens", hasSize(1)))
            .andExpect(jsonPath("$.specimens[0].name", is("Morning")));
    }

    private String facetsJson(SpecimenFacets specimenFacets) throws Exception {
        return objectMapper.writeValueAsString(specimenFacets);
    }
}
