package cz.incad.nkp.inprove.permonikapi;

import static org.junit.jupiter.api.Assertions.assertEquals;

import cz.incad.nkp.inprove.permonikapi.specimen.SpecimenNaturalSortKey;
import cz.incad.nkp.inprove.permonikapi.support.SolrFixtureFactory;
import cz.incad.nkp.inprove.permonikapi.support.SolrTestSupport;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.apache.solr.client.solrj.impl.HttpJdkSolrClient;
import org.apache.solr.client.solrj.request.SolrQuery;
import org.apache.solr.common.SolrInputDocument;
import org.junit.jupiter.api.Test;

/** Exercises production schemas on the isolated Solr without starting the application context. */
class SolrIndexLayoutTest {
    /** Preserves stored-only volume data and rebuilds collation keys during reference renames. */
    @Test
    void atomicRenamePreservesStoredDataAndRebuildsSortKeys() throws Exception {
        try (var client = client()) {
            SolrTestSupport.clearCore(client, "volume");
            String firstId = UUID.randomUUID().toString();
            String secondId = UUID.randomUUID().toString();
            var first = SolrFixtureFactory.volumeForOwner(firstId, "owner", "Zeta", "Z", "Z001");
            Map<String, Object> stored =
                    Map.of(
                            "subname", "Stored subtitle",
                            "first_number", 3,
                            "last_number", 9,
                            "note", "Stored note",
                            "attachments_sort", "DESC",
                            "signature", "Stored signature");
            stored.forEach(first::setField);
            client.add(
                    "volume",
                    List.of(
                            first,
                            SolrFixtureFactory.volumeForOwner(
                                    secondId, "other", "Alpha", "A", "A001")));
            client.commit("volume");
            assertEquals(
                    List.of(secondId, firstId), sortedIds(client, "volume", "owner_name_sort"));

            var update = new SolrInputDocument();
            update.setField("id", firstId);
            update.setField("owner_name", Map.of("set", "Aardvark"));
            client.add("volume", update);
            client.commit("volume");
            assertEquals(
                    List.of(firstId, secondId), sortedIds(client, "volume", "owner_name_sort"));
            var loaded = client.getById("volume", firstId);
            stored.forEach(
                    (field, value) -> assertEquals(value, loaded.getFieldValue(field), field));
            assertEquals("[]", loaded.getFieldValue("periodicity"));
            var query = new SolrQuery("owner_name_search:Aardvark");
            query.setFacet(true).addFacetField("owner_name");
            var result = client.query("volume", query);
            assertEquals(1, result.getResults().getNumFound());
            assertEquals(
                    "Aardvark",
                    result.getFacetField("owner_name").getValues().getFirst().getName());
        }
    }

    /** Keeps the independent DocValues-only natural key through unrelated atomic updates. */
    @Test
    void naturalSortKeySurvivesAtomicUpdate() throws Exception {
        try (var client = client()) {
            SolrTestSupport.clearCore(client, "specimen");
            String firstId = UUID.randomUUID().toString();
            String secondId = UUID.randomUUID().toString();
            var first = SolrFixtureFactory.specimenForOwner(firstId, "owner", "Owner", "O", "O001");
            first.setField("number", "2");
            first.setField("number_sort_key", SpecimenNaturalSortKey.from("2"));
            var second =
                    SolrFixtureFactory.specimenForOwner(secondId, "owner", "Owner", "O", "O001");
            second.setField("number", "10");
            second.setField("number_sort_key", SpecimenNaturalSortKey.from("10"));
            client.add("specimen", List.of(first, second));
            client.commit("specimen");
            var update = new SolrInputDocument();
            update.setField("id", firstId);
            update.setField("owner_name", Map.of("set", "Renamed owner"));
            client.add("specimen", update);
            client.commit("specimen");
            assertEquals(
                    List.of(firstId, secondId), sortedIds(client, "specimen", "number_sort_key"));
            assertEquals(
                    SpecimenNaturalSortKey.from("2"),
                    client.getById("specimen", firstId).getFieldValue("number_sort_key"));
        }
    }

    /** Preserves issue-317 owner-column sorting and issue/page filters on optimized schemas. */
    @Test
    void ownerBarcodeFunctionAndNumberPageFiltersRemainSupported() throws Exception {
        try (var client = client()) {
            SolrTestSupport.clearCore(client, "specimen");
            String firstId = UUID.randomUUID().toString();
            String secondId = UUID.randomUUID().toString();
            String otherId = UUID.randomUUID().toString();
            var first = SolrFixtureFactory.specimenForOwner(firstId, "owner", "Alpha", "A", "A001");
            first.setField("bar_code", "002");
            first.setField("number", "2");
            first.setField("number_sort_key", SpecimenNaturalSortKey.from("2"));
            first.setField("pages_count", 4);
            var second =
                    SolrFixtureFactory.specimenForOwner(secondId, "owner", "Alpha", "A", "A001");
            second.setField("bar_code", "010");
            second.setField("number", "10");
            second.setField("number_sort_key", SpecimenNaturalSortKey.from("10"));
            second.setField("pages_count", 16);
            var other = SolrFixtureFactory.specimenForOwner(otherId, "other", "Beta", "B", "B001");
            client.add("specimen", List.of(first, second, other));
            client.commit("specimen");

            var sorting = new SolrQuery("*:*");
            sorting.addSort(
                    "if(termfreq(owner_name,'Alpha'),sum(ord(bar_code),1),0)", SolrQuery.ORDER.asc);
            sorting.addSort("number_sort_key", SolrQuery.ORDER.asc);
            sorting.setFields("id");
            assertEquals(
                    List.of(otherId, firstId, secondId),
                    client.query("specimen", sorting).getResults().stream()
                            .map(doc -> (String) doc.getFieldValue("id"))
                            .toList());

            var filtered = new SolrQuery("*:*");
            filtered.addFilterQuery("number:\"2\"");
            filtered.addFilterQuery("pages_count:[1 TO 5]");
            var result = client.query("specimen", filtered).getResults();
            assertEquals(1, result.getNumFound());
            assertEquals(firstId, result.getFirst().getFieldValue("id"));
        }
    }

    /** Retains language-specific collation without an inverted index on sort fields. */
    @Test
    void collationStillDistinguishesCzechSlovakAndEnglishOrdering() throws Exception {
        try (var client = client()) {
            SolrTestSupport.clearCore(client, "mutation");
            String h = UUID.randomUUID().toString();
            String ch = UUID.randomUUID().toString();
            String i = UUID.randomUUID().toString();
            client.add(
                    "mutation",
                    List.of(
                            SolrFixtureFactory.mutationDoc(h, "Hana", "Hana", "Hana"),
                            SolrFixtureFactory.mutationDoc(ch, "Chata", "Chata", "Chata"),
                            SolrFixtureFactory.mutationDoc(i, "Irena", "Irena", "Irena")));
            client.commit("mutation");
            assertEquals(List.of(h, ch, i), sortedIds(client, "mutation", "name_cs_sort"));
            assertEquals(List.of(h, ch, i), sortedIds(client, "mutation", "name_sk_sort"));
            assertEquals(List.of(ch, h, i), sortedIds(client, "mutation", "name_en_sort"));
        }
    }

    /** Connects to the existing isolated test fixture with freshly loaded production configsets. */
    private static HttpJdkSolrClient client() {
        var solr = AbstractSolrIntegrationTest.SOLR;
        return new HttpJdkSolrClient.Builder(
                        "http://" + solr.getHost() + ":" + solr.getSolrPort() + "/solr")
                .build();
    }

    /** Reads IDs in the actual Solr field order rather than sorting values in the test. */
    private static List<String> sortedIds(HttpJdkSolrClient client, String core, String field)
            throws Exception {
        var query = new SolrQuery("*:*").setSort(field, SolrQuery.ORDER.asc).setFields("id");
        return client.query(core, query).getResults().stream()
                .map(doc -> (String) doc.getFieldValue("id"))
                .toList();
    }
}
