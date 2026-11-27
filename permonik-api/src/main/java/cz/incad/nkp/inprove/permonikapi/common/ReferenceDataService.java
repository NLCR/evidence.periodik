package cz.incad.nkp.inprove.permonikapi.common;

import static cz.incad.nkp.inprove.permonikapi.audit.AuditableDefinition.DELETED_FIELD;
import static cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition.DATE_FROM_FIELD;
import static cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition.DATE_TO_FIELD;
import static cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition.ID_FIELD;
import static cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition.META_TITLE_ID_FIELD;
import static cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition.MUTATION_CS_NAME_FIELD;
import static cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition.MUTATION_EN_NAME_FIELD;
import static cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition.MUTATION_ID_FIELD;
import static cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition.MUTATION_MARK_FIELD;
import static cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition.MUTATION_MARK_TYPE_FIELD;
import static cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition.MUTATION_SK_NAME_FIELD;
import static cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition.OWNER_ID_FIELD;
import static cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition.VOLUME_CORE_NAME;

import cz.incad.nkp.inprove.permonikapi.edition.model.Edition;
import cz.incad.nkp.inprove.permonikapi.edition.model.EditionDefinition;
import cz.incad.nkp.inprove.permonikapi.metaTitle.MetaTitle;
import cz.incad.nkp.inprove.permonikapi.metaTitle.MetaTitleDefinition;
import cz.incad.nkp.inprove.permonikapi.mutation.dto.MutationNameDTO;
import cz.incad.nkp.inprove.permonikapi.mutation.model.Mutation;
import cz.incad.nkp.inprove.permonikapi.mutation.model.MutationDefinition;
import cz.incad.nkp.inprove.permonikapi.owner.Owner;
import cz.incad.nkp.inprove.permonikapi.owner.OwnerDefinition;
import cz.incad.nkp.inprove.permonikapi.volume.model.Volume;
import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.request.SolrQuery;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.client.solrj.response.json.BucketJsonFacet;
import org.apache.solr.client.solrj.response.json.NestableJsonFacet;
import org.apache.solr.client.solrj.util.ClientUtils;
import org.apache.solr.common.SolrException;
import org.apache.solr.common.util.Utils;
import org.jspecify.annotations.Nullable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ReferenceDataService {

    private final SolrClient solrClient;

    /** Escapes an exact stored string value instead of accepting caller-supplied Solr syntax. */
    private static String exact(String field, String value) {
        return field + ":\"" + ClientUtils.escapeQueryChars(value) + "\"";
    }

    private static boolean hasPartialResults(QueryResponse response) {
        var header = response.getHeader();
        var partialResults = header == null ? null : header.get("partialResults");
        return partialResults != null && !"false".equals(partialResults.toString());
    }

    /**
     * Searches active same-title volumes with inclusive UTC-day overlap and optional source
     * equality filters.
     */
    public ReplacementPage searchReplacementVolumes(
            Volume primary,
            boolean matchOwner,
            boolean matchMutation,
            boolean matchEdition,
            int pageSize,
            String cursorMark)
            throws SolrServerException, IOException {
        var from = primary.getDateFrom().toInstant().atZone(ZoneOffset.UTC).toLocalDate();
        var to = primary.getDateTo().toInstant().atZone(ZoneOffset.UTC).toLocalDate();
        SolrQuery query = new SolrQuery("*:*");
        query.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        query.addFilterQuery("-" + exact(ID_FIELD, primary.getId()));
        query.addFilterQuery(exact(META_TITLE_ID_FIELD, primary.getMetaTitleId()));
        query.addFilterQuery(
                DATE_FROM_FIELD
                        + ":[* TO "
                        + to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant()
                        + "}");
        query.addFilterQuery(
                DATE_TO_FIELD + ":[" + from.atStartOfDay(ZoneOffset.UTC).toInstant() + " TO *]");
        if (matchOwner) {
            query.addFilterQuery(exact(OWNER_ID_FIELD, primary.getOwnerId()));
        }
        if (matchMutation) {
            query.addFilterQuery(exact(MUTATION_ID_FIELD, primary.getMutationId()));
        }
        if (matchEdition) {
            query.addFilterQuery(exact(MUTATION_MARK_TYPE_FIELD, primary.getMutationMarkType()));
            query.addFilterQuery(
                    primary.rawMutationMark() == null
                            ? "-" + MUTATION_MARK_FIELD + ":[* TO *]"
                            : exact(MUTATION_MARK_FIELD, primary.rawMutationMark()));
        }
        query.setRows(pageSize);
        query.setSort(ID_FIELD, SolrQuery.ORDER.asc);
        String cursor = cursorMark.isEmpty() ? "*" : cursorMark;
        query.set("cursorMark", cursor);
        QueryResponse response;
        try {
            response = solrClient.query(VOLUME_CORE_NAME, query);
        } catch (SolrException exception) {
            if (exception.code() == 400) {
                throw new SolrServerException("Invalid replacement cursor", exception);
            }
            throw exception;
        }
        String next = response.getNextCursorMark();
        if (next == null || hasPartialResults(response)) {
            throw new SolrServerException("Incomplete replacement search response");
        }
        String token = cursor.equals(next) ? "" : next;
        return new ReplacementPage(response.getBeans(Volume.class), token);
    }

    /**
     * Searches active volumes for planning with exact metadata filters and cursor-bound pagination.
     */
    public record PlanningFilters(
            String metaTitleId,
            @Nullable Integer yearFrom,
            @Nullable Integer yearTo,
            @Nullable String mutationId,
            @Nullable String mutationMark,
            @Nullable String mutationMarkType) {
        private SolrQuery baseQuery() {
            SolrQuery query = new SolrQuery("*:*");
            query.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
            query.addFilterQuery(exact(META_TITLE_ID_FIELD, metaTitleId));
            if (yearFrom != null) {
                query.addFilterQuery(DATE_TO_FIELD + ":[" + yearStart(yearFrom) + " TO *]");
            }
            if (yearTo != null) {
                query.addFilterQuery(DATE_FROM_FIELD + ":[* TO " + yearStart(yearTo + 1) + "}");
            }
            return query;
        }

        private String mutationQuery() {
            return mutationId == null ? "*:*" : exact(MUTATION_ID_FIELD, mutationId);
        }
    }

    private static List<String> planningEditionFilters(
            @Nullable String mutationMark, @Nullable String mutationMarkType) {
        var filters = new ArrayList<String>();
        if (mutationMarkType != null) {
            filters.add(exact(MUTATION_MARK_TYPE_FIELD, mutationMarkType));
        }
        if (mutationMark != null) {
            filters.add(exact(MUTATION_MARK_FIELD, mutationMark));
        } else if ("UNMARKED".equals(mutationMarkType)) {
            filters.add("-" + MUTATION_MARK_FIELD + ":[* TO *]");
        }
        return filters;
    }

    public PlanningPage searchPlanningVolumes(
            PlanningFilters filters, int pageSize, String cursorMark)
            throws SolrServerException, IOException {
        SolrQuery query = filters.baseQuery();
        if (filters.mutationId() != null) query.addFilterQuery(filters.mutationQuery());
        planningEditionFilters(filters.mutationMark(), filters.mutationMarkType())
                .forEach(query::addFilterQuery);
        query.setRows(pageSize);
        query.setSort(ID_FIELD, SolrQuery.ORDER.asc);
        String cursor = cursorMark.isEmpty() ? "*" : cursorMark;
        query.set("cursorMark", cursor);
        QueryResponse response;
        try {
            response = solrClient.query(VOLUME_CORE_NAME, query);
        } catch (SolrException exception) {
            if (exception.code() == 400) {
                throw new SolrServerException("Invalid planning cursor", exception);
            }
            throw exception;
        }
        String next = response.getNextCursorMark();
        if (next == null || hasPartialResults(response)) {
            throw new SolrServerException("Incomplete planning response");
        }
        String token = cursor.equals(next) ? "" : next;
        return new PlanningPage(response.getBeans(Volume.class), token);
    }

    public record MutationCount(String id, MutationNameDTO name, long count) {}

    public record EditionCount(String type, @Nullable String mark, long count) {}

    public record PlanningFacets(List<MutationCount> mutations, List<EditionCount> editions) {}

    /** Each facet applies the opposite selection without narrowing its own options. */
    public PlanningFacets queryPlanningFacets(PlanningFilters filters)
            throws SolrServerException, IOException {
        SolrQuery query = filters.baseQuery();
        query.setRows(0);
        query.setTimeAllowed(1000);
        query.set("json.facet", Utils.toJSONString(planningFacetSpec(filters)));

        QueryResponse response = solrClient.query(VOLUME_CORE_NAME, query);
        if (response.getHeader() == null || hasPartialResults(response)) {
            throw new SolrServerException("Incomplete planning facets response");
        }
        var facets = response.getJsonFacetingResponse();
        if (facets == null) throw new SolrServerException("Missing planning facets");
        if (facets.getCount() == 0) return new PlanningFacets(List.of(), List.of());
        return new PlanningFacets(
                readMutationCounts(facets.getQueryFacet("mutations")),
                readEditionCounts(facets.getQueryFacet("editions")));
    }

    private static Map<String, Object> planningFacetSpec(PlanningFilters filters) {
        var editionMarks = Map.of("marks", terms(MUTATION_MARK_FIELD));
        var editionTypes =
                Map.of(
                        "MARK", queryFacet(planningEditionFilters(null, "MARK"), editionMarks),
                        "NUMBER", queryFacet(planningEditionFilters(null, "NUMBER"), editionMarks),
                        "UNMARKED", queryFacet(planningEditionFilters(null, "UNMARKED"), Map.of()));
        var mutations =
                queryFacet(
                        planningEditionFilters(filters.mutationMark(), filters.mutationMarkType()),
                        Map.of("ids", mutationTerms()));
        var editions = queryFacet(List.of(filters.mutationQuery()), editionTypes);
        return Map.of("mutations", mutations, "editions", editions);
    }

    private static List<MutationCount> readMutationCounts(NestableJsonFacet mutations)
            throws SolrServerException {
        if (mutations.getCount() == 0) return List.of();
        var counts = new ArrayList<MutationCount>();
        for (var bucket : mutations.getBucketBasedFacets("ids").getBuckets()) {
            var name =
                    new MutationNameDTO(
                            mutationName(bucket, "cs"),
                            mutationName(bucket, "sk"),
                            mutationName(bucket, "en"));
            counts.add(new MutationCount(bucket.getVal().toString(), name, bucket.getCount()));
        }
        return counts;
    }

    private static List<EditionCount> readEditionCounts(NestableJsonFacet editions) {
        if (editions.getCount() == 0) return List.of();
        var counts = new ArrayList<EditionCount>();
        for (String type : List.of("MARK", "NUMBER")) {
            var typeFacet = editions.getQueryFacet(type);
            if (typeFacet.getCount() == 0) continue;
            for (var bucket : typeFacet.getBucketBasedFacets("marks").getBuckets()) {
                String mark = bucket.getVal().toString();
                if (!mark.isBlank()) counts.add(new EditionCount(type, mark, bucket.getCount()));
            }
        }
        long unmarked = editions.getQueryFacet("UNMARKED").getCount();
        if (unmarked > 0) counts.add(new EditionCount("UNMARKED", null, unmarked));
        return counts;
    }

    private static Map<String, Object> queryFacet(List<String> filters, Map<String, ?> subFacets) {
        return Map.of(
                "type",
                "query",
                "q",
                "*:*",
                "domain",
                Map.of("filter", filters),
                "facet",
                subFacets);
    }

    private static Map<String, Object> terms(String field) {
        return Map.of(
                "type", "terms", "field", field, "limit", -1, "mincount", 1, "sort", "index asc");
    }

    private static Map<String, Object> mutationTerms() {
        var facet = new HashMap<>(terms(MUTATION_ID_FIELD));
        facet.put(
                "facet",
                Map.of(
                        "cs", nameFacet(MUTATION_CS_NAME_FIELD),
                        "sk", nameFacet(MUTATION_SK_NAME_FIELD),
                        "en", nameFacet(MUTATION_EN_NAME_FIELD)));
        return facet;
    }

    private static Map<String, Object> nameFacet(String field) {
        return Map.of("type", "terms", "field", field, "limit", 1, "sort", "count desc");
    }

    private static String mutationName(BucketJsonFacet bucket, String language)
            throws SolrServerException {
        var names = bucket.getBucketBasedFacets(language);
        if (names == null
                || names.getBuckets().isEmpty()
                || !(names.getBuckets().getFirst().getVal() instanceof String name)
                || name.isBlank()) {
            throw new SolrServerException("Missing localized mutation name in planning facets");
        }
        return name;
    }

    /** Returns the UTC start instant used for inclusive calendar-year overlap filtering. */
    private static String yearStart(int year) {
        return LocalDate.of(year, 1, 1).atStartOfDay(ZoneOffset.UTC).toInstant().toString();
    }

    /**
     * Loads complete active volumes in one escaped ID query and rejects incomplete Solr responses.
     */
    public List<Volume> getVolumesByIds(Collection<String> ids)
            throws SolrServerException, IOException {
        if (ids.isEmpty()) {
            return List.of();
        }
        SolrQuery query = new SolrQuery("*:*");
        query.addFilterQuery(
                "id:("
                        + ids.stream()
                                .map(id -> "\"" + ClientUtils.escapeQueryChars(id) + "\"")
                                .collect(Collectors.joining(" OR "))
                        + ")");
        query.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        query.setRows(ids.size());
        QueryResponse response = solrClient.query(VOLUME_CORE_NAME, query);
        List<Volume> beans = response.getBeans(Volume.class);
        if (response.getResults().getNumFound() != beans.size() || hasPartialResults(response)) {
            throw new SolrServerException("Incomplete reference query response");
        }
        return beans;
    }

    public MetaTitle resolveMetaTitle(String id) throws SolrServerException, IOException {
        List<MetaTitle> results =
                queryById(MetaTitleDefinition.META_TITLE_CORE_NAME, id, MetaTitle.class);
        if (results.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "MetaTitle not found: " + id);
        }
        return results.getFirst();
    }

    public Mutation resolveMutation(String id) throws SolrServerException, IOException {
        List<Mutation> results =
                queryById(MutationDefinition.MUTATION_CORE_NAME, id, Mutation.class);
        if (results.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Mutation not found: " + id);
        }
        return results.getFirst();
    }

    public Owner resolveOwner(String id) throws SolrServerException, IOException {
        List<Owner> results = queryById(OwnerDefinition.OWNER_CORE_NAME, id, Owner.class);
        if (results.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Owner not found: " + id);
        }
        return results.getFirst();
    }

    public Edition resolveEdition(String id) throws SolrServerException, IOException {
        List<Edition> results = queryById(EditionDefinition.EDITION_CORE_NAME, id, Edition.class);
        if (results.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Edition not found: " + id);
        }
        return results.getFirst();
    }

    public Volume resolveVolume(String id) throws SolrServerException, IOException {
        List<Volume> results = queryById(VOLUME_CORE_NAME, id, Volume.class);
        if (results.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Volume not found: " + id);
        }
        return results.getFirst();
    }

    private <T> List<T> queryById(String coreName, String id, Class<T> clazz)
            throws SolrServerException, IOException {
        SolrQuery query = new SolrQuery("*:*");
        query.addFilterQuery("id:\"" + ClientUtils.escapeQueryChars(id) + "\"");
        query.setRows(1);
        return solrClient.query(coreName, query).getBeans(clazz);
    }

    public record ReplacementPage(List<Volume> volumes, String nextCursorMark) {}

    public record PlanningPage(List<Volume> volumes, String nextCursorMark) {}
}
