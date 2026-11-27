package cz.incad.nkp.inprove.permonikapi.volume;

import static cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition.*;
import static org.assertj.core.api.Assertions.assertThat;

import cz.incad.nkp.inprove.permonikapi.AbstractSolrIntegrationTest;
import cz.incad.nkp.inprove.permonikapi.common.ReferenceDataService;
import cz.incad.nkp.inprove.permonikapi.common.ReferenceDataService.EditionCount;
import cz.incad.nkp.inprove.permonikapi.common.ReferenceDataService.MutationCount;
import cz.incad.nkp.inprove.permonikapi.common.ReferenceDataService.PlanningFilters;
import cz.incad.nkp.inprove.permonikapi.mutation.dto.MutationNameDTO;
import cz.incad.nkp.inprove.permonikapi.support.SolrFixtureFactory;
import cz.incad.nkp.inprove.permonikapi.support.SolrTestSupport;
import java.util.List;
import java.util.UUID;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.common.SolrInputDocument;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class PlanningFacetsIntegrationTest extends AbstractSolrIntegrationTest {
    @Autowired SolrClient solr;
    @Autowired ReferenceDataService references;

    @Test
    void countsDistinctVolumesUnderTheOppositeFacetSelection() throws Exception {
        SolrTestSupport.clearCores(solr, VOLUME_CORE_NAME);
        var deleted = volume("title", "a", "MARK", "***");
        deleted.setField("deleted", "2026-01-01T00:00:00Z");
        solr.add(
                VOLUME_CORE_NAME,
                List.of(
                        volume("title", "a", "MARK", "***"),
                        volume("title", "a", "MARK", "x"),
                        volume("title", "a", "MARK", "1"),
                        volume("title", "a", "NUMBER", "1"),
                        volume("title", "a", "UNMARKED", null),
                        volume("title", "b", "MARK", "***"),
                        volume("other", "a", "MARK", "***"),
                        deleted));
        solr.commit(VOLUME_CORE_NAME);

        var filters = new PlanningFilters("title", 1950, 1951, "a", "***", "MARK");
        var facets = references.queryPlanningFacets(filters);
        assertThat(facets.mutations())
                .containsExactly(mutationCount("a", 1), mutationCount("b", 1));
        assertThat(facets.editions())
                .containsExactlyInAnyOrder(
                        new EditionCount("MARK", "***", 1),
                        new EditionCount("MARK", "x", 1),
                        new EditionCount("MARK", "1", 1),
                        new EditionCount("NUMBER", "1", 1),
                        new EditionCount("UNMARKED", null, 1));
        assertThat(references.searchPlanningVolumes(filters, 100, "").volumes()).hasSize(1);

        var unmarked = new PlanningFilters("title", 1951, 1951, null, null, "UNMARKED");
        assertThat(references.queryPlanningFacets(unmarked).mutations())
                .containsExactly(mutationCount("a", 1));
        assertThat(references.searchPlanningVolumes(unmarked, 100, "").volumes()).hasSize(1);

        var empty =
                references.queryPlanningFacets(
                        new PlanningFilters("title", 1952, 1952, null, null, null));
        assertThat(empty.mutations()).isEmpty();
        assertThat(empty.editions()).isEmpty();
    }

    private MutationCount mutationCount(String id, long count) {
        return new MutationCount(
                id, new MutationNameDTO("CS " + id, "SK " + id, "EN " + id), count);
    }

    private SolrInputDocument volume(String title, String mutation, String type, String mark) {
        var doc = SolrFixtureFactory.volumeForMetaTitle(UUID.randomUUID().toString(), title, title);
        doc.setField(DATE_FROM_FIELD, "1950-03-01T00:00:00Z");
        doc.setField(DATE_TO_FIELD, "1951-06-01T00:00:00Z");
        doc.setField(MUTATION_ID_FIELD, mutation);
        doc.setField(MUTATION_CS_NAME_FIELD, "CS " + mutation);
        doc.setField(MUTATION_SK_NAME_FIELD, "SK " + mutation);
        doc.setField(MUTATION_EN_NAME_FIELD, "EN " + mutation);
        doc.setField(MUTATION_MARK_TYPE_FIELD, type);
        doc.setField(MUTATION_MARK_FIELD, mark);
        return doc;
    }
}
