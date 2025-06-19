package cz.incad.nkp.inprove.permonikapi.specimen;

import com.fasterxml.jackson.databind.ObjectMapper;
import cz.incad.nkp.inprove.permonikapi.specimen.dto.*;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.response.*;
import org.apache.solr.common.params.GroupParams;
import org.apache.solr.common.params.StatsParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

import static cz.incad.nkp.inprove.permonikapi.audit.AuditableDefinition.DELETED_FIELD;
import static cz.incad.nkp.inprove.permonikapi.utils.DateValidator.isValidDate;

@Service
public class SpecimenService implements SpecimenDefinition {

    private static final Logger logger = LoggerFactory.getLogger(SpecimenService.class);

    private final SolrClient solrClient;

    @Autowired
    public SpecimenService(SolrClient solrClient) {
        this.solrClient = solrClient;
    }


    public StatsForMetaTitleOverviewDTO getStatsForMetaTitleOverview(String metaTitleId) throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.setFilterQueries(META_TITLE_ID_FIELD + ":\"" + metaTitleId + "\"", NUM_EXISTS_FIELD + ":true");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setParam(StatsParams.STATS, true);
        solrQuery.setParam(StatsParams.STATS_FIELD, MUTATION_ID_FIELD, PUBLICATION_DATE_STRING_FIELD, OWNER_ID_FIELD);
        solrQuery.setParam(StatsParams.STATS_CALC_DISTINCT, true);
        solrQuery.setParam(GroupParams.GROUP, true);
        solrQuery.setParam(GroupParams.GROUP_FIELD, META_TITLE_ID_FIELD);
        solrQuery.setParam(GroupParams.GROUP_LIMIT, "1");
        solrQuery.setParam(GroupParams.GROUP_TOTAL_COUNT, true);
        solrQuery.setRows(0);

        QueryResponse response = solrClient.query(SPECIMEN_CORE_NAME, solrQuery);

        Map<String, FieldStatsInfo> statsInfo = response.getFieldStatsInfo();

        FieldStatsInfo mutationsStats = statsInfo.get(MUTATION_ID_FIELD);
        FieldStatsInfo publicationDayStats = statsInfo.get(PUBLICATION_DATE_STRING_FIELD);
        FieldStatsInfo ownersStats = statsInfo.get(OWNER_ID_FIELD);

        Long mutationsCount = mutationsStats.getCountDistinct();
        Object publicationDayMin = publicationDayStats.getMin();
        Object publicationDayMax = publicationDayStats.getMax();
        Long ownersCount = ownersStats.getCountDistinct();

        GroupResponse groupResponse = response.getGroupResponse();
        GroupCommand groupCommand = groupResponse.getValues().getFirst();
        Integer matchedSpecimens = groupCommand.getMatches();


        return new StatsForMetaTitleOverviewDTO(publicationDayMin, publicationDayMax, mutationsCount, ownersCount, matchedSpecimens);

    }


    public SearchedSpecimensDTO getSearchedSpecimens(String metaTitleId, Integer offset, Integer rows, String facets, String view) throws IOException, SolrServerException {

        Integer localRows = rows;

        ObjectMapper objectMapper = new ObjectMapper();
        SpecimenFacets specimenFacets = objectMapper.readValue(facets, SpecimenFacets.class);

        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.setFilterQueries(META_TITLE_ID_FIELD + ":\"" + metaTitleId + "\"", NUM_EXISTS_FIELD + ":true");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");

        if (!specimenFacets.getNames().isEmpty()) {
            solrQuery.addFilterQuery(specimenFacets.getNamesQueryString());
        }

        if (!specimenFacets.getSubNames().isEmpty()) {
            solrQuery.addFilterQuery(specimenFacets.getSubNamesQueryString());
        }

        if (!specimenFacets.getMutationIds().isEmpty()) {
            solrQuery.addFilterQuery(specimenFacets.getMutationsQueryString());
        }

        if (!specimenFacets.getEditionIds().isEmpty()) {
            solrQuery.addFilterQuery(specimenFacets.getEditionsQueryString());
        }

        if (!specimenFacets.getMutationMarks().isEmpty()) {
            solrQuery.addFilterQuery(specimenFacets.getMutationMarkQueryString());
        }


        if (!specimenFacets.getOwnerIds().isEmpty()) {
            solrQuery.addFilterQuery(specimenFacets.getOwnersQueryString());
        }

        if (!specimenFacets.getDamageTypes().isEmpty()) {
            solrQuery.addFilterQuery(specimenFacets.getDamageTypesQueryString());
        }

        if (!specimenFacets.getBarCode().isEmpty()) {
            solrQuery.addFilterQuery(specimenFacets.getBarCodeQueryString());
        }

        // Add filtering based on year interval
        if (specimenFacets.getDateStart() > 0 && specimenFacets.getDateEnd() > 0 && Objects.equals(view, "table")) {
            // getDateStart -> format: 2024 -> [2024-01-01 TO *]
            solrQuery.addFilterQuery(PUBLICATION_DATE_FIELD + ":[" + specimenFacets.getDateStart() + "-01-01 TO *]");
            solrQuery.addFilterQuery(PUBLICATION_DATE_FIELD + ":[* TO " + specimenFacets.getDateEnd() + "-12-31]");
        }

        if (Objects.equals(view, "calendar") && specimenFacets.getCalendarDateStart() != null && !specimenFacets.getCalendarDateStart().isEmpty()) {
            if (isValidDate(specimenFacets.getCalendarDateStart())) {
                // getCalendarDateStart -> format: 1953-01-01T00:00:00.000Z -> [1953-01-01T00:00:00.000Z TO *]
                solrQuery.addFilterQuery(PUBLICATION_DATE_FIELD + ":[" + specimenFacets.getCalendarDateStart() + " TO *]");
                solrQuery.addFilterQuery(PUBLICATION_DATE_FIELD + ":[* TO " + specimenFacets.getCalendarDateEnd() + "]");
            } else {
                //preventing return of 1000 rows in calendar when calendar date isn't initialized yet
                localRows = 0;
            }
        }

        // copy query this way, because we need same filters
        SolrQuery groupQuery;
        groupQuery = solrQuery;

        solrQuery.setRows(localRows);
        solrQuery.setStart(offset);
        solrQuery.setSort(PUBLICATION_DATE_STRING_FIELD, SolrQuery.ORDER.asc);
        // TODO: join is not working, it always returns unknown field volumeId
//        solrQuery.add("join", "{!join from=volumeId to=id fromIndex=volume}barCode:barCode");
        // TODO: this will be sorting based on UUID, that's wrong
        solrQuery.addSort(EDITION_ID_FIELD, SolrQuery.ORDER.desc);
//        solrQuery.addSort(MUTATION_ID_FIELD, SolrQuery.ORDER.asc);

        QueryResponse response = solrClient.query(SPECIMEN_CORE_NAME, solrQuery);
        List<Specimen> specimenList = response.getBeans(Specimen.class);
        List<String> ownerList = specimenList.stream()
            .map(Specimen::getOwnerId)
            .collect(Collectors.toSet()).stream().toList();

        SolrQuery statsQuery = new SolrQuery("*:*");
        statsQuery.setFilterQueries(META_TITLE_ID_FIELD + ":\"" + metaTitleId + "\"", NUM_EXISTS_FIELD + ":true");
        statsQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        statsQuery.setRows(0);
        statsQuery.setParam(StatsParams.STATS, true);
        statsQuery.setParam(StatsParams.STATS_FIELD, PUBLICATION_DATE_STRING_FIELD);

        QueryResponse statsResponse = solrClient.query(SPECIMEN_CORE_NAME, statsQuery);

        Map<String, FieldStatsInfo> statsInfo = statsResponse.getFieldStatsInfo();
        FieldStatsInfo publicationDayStats = statsInfo.get(PUBLICATION_DATE_STRING_FIELD);

        Object publicationDayMin = publicationDayStats.getMin();
        Object publicationDayMax = publicationDayStats.getMax();

        groupQuery.setRows(rows);
        groupQuery.setStart(offset);
        groupQuery.setParam(GroupParams.GROUP, true);
        groupQuery.setParam(GroupParams.GROUP_FIELD, VOLUME_ID_FIELD);
        groupQuery.setParam(GroupParams.GROUP_LIMIT, "20");
        groupQuery.setParam(GroupParams.GROUP_TOTAL_COUNT, true);

        GroupResponse groupResponse = solrClient.query(SPECIMEN_CORE_NAME, solrQuery).getGroupResponse();

        GroupCommand groupCommand = groupResponse.getValues().getFirst();
        Integer groupedSpecimens = groupCommand.getMatches();

        return new SearchedSpecimensDTO(
            specimenList,
            publicationDayMax,
            publicationDayMin,
            groupedSpecimens,
            ownerList
        );

    }

    public FacetsDTO getSpecimensFacets(String metaTitleId, String facets, String view) throws IOException, SolrServerException {

        ObjectMapper objectMapper = new ObjectMapper();
        SpecimenFacets specimenFacets = objectMapper.readValue(facets, SpecimenFacets.class);

        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.setFilterQueries(META_TITLE_ID_FIELD + ":\"" + metaTitleId + "\"", NUM_EXISTS_FIELD + ":true");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setRows(0);
        solrQuery.setStart(0);
//        solrQuery.setSort(PUBLICATION_DATE_STRING_FIELD, SolrQuery.ORDER.asc);
        // TODO this will be sorting based on UUID, that's wrong
        solrQuery.addSort(EDITION_ID_FIELD, SolrQuery.ORDER.desc);
//        solrQuery.addSort(MUTATION_ID_FIELD, SolrQuery.ORDER.asc);
        solrQuery.setFacet(true);
        solrQuery.setParam("f." + MUTATION_MARK_FIELD + ".facet.missing", "true"); // query MUTATION_MARK_FIELD also for empty value
        solrQuery.addFacetField(NAME_FIELD, SUB_NAME_FIELD, MUTATION_ID_FIELD, EDITION_ID_FIELD, MUTATION_MARK_FIELD, OWNER_ID_FIELD, DAMAGE_TYPES_FIELD);
        solrQuery.setFacetMinCount(1);

        if (!specimenFacets.getNames().isEmpty()) {
            solrQuery.addFilterQuery(specimenFacets.getNamesQueryString());
        }

        if (!specimenFacets.getSubNames().isEmpty()) {
            solrQuery.addFilterQuery(specimenFacets.getSubNamesQueryString());
        }

        if (!specimenFacets.getMutationIds().isEmpty()) {
            solrQuery.addFilterQuery(specimenFacets.getMutationsQueryString());
        }

        if (!specimenFacets.getEditionIds().isEmpty()) {
            solrQuery.addFilterQuery(specimenFacets.getEditionsQueryString());
        }

        if (!specimenFacets.getMutationMarks().isEmpty()) {
            solrQuery.addFilterQuery(specimenFacets.getMutationMarkQueryString());
        }

        if (!specimenFacets.getOwnerIds().isEmpty()) {
            solrQuery.addFilterQuery(specimenFacets.getOwnersQueryString());
        }

        if (!specimenFacets.getDamageTypes().isEmpty()) {
            solrQuery.addFilterQuery(specimenFacets.getDamageTypesQueryString());
        }

        if (!specimenFacets.getBarCode().isEmpty()) {
            solrQuery.addFilterQuery(specimenFacets.getBarCodeQueryString());
        }

        // Add filtering based on year interval for table view
        if (specimenFacets.getDateStart() > 0 && specimenFacets.getDateEnd() > 0 && Objects.equals(view, "table")) {
            // getDateStart -> format: 2024 -> [2024-01-01 TO *]
            solrQuery.addFilterQuery(PUBLICATION_DATE_FIELD + ":[" + specimenFacets.getDateStart() + "-01-01 TO *]");
            solrQuery.addFilterQuery(PUBLICATION_DATE_FIELD + ":[* TO " + specimenFacets.getDateEnd() + "-12-31]");
        }

        logger.info("SOLR QUERY: {}", solrQuery.toQueryString());
        QueryResponse response = solrClient.query(SPECIMEN_CORE_NAME, solrQuery);

        return new FacetsDTO(
            response.getFacetField(NAME_FIELD).getValues().stream().map(facetFieldEntry ->
                new FacetFieldDTO(facetFieldEntry.getName(), facetFieldEntry.getCount())
            ).toList(),
            response.getFacetField(SUB_NAME_FIELD).getValues().stream().map(facetFieldEntry ->
                new FacetFieldDTO(facetFieldEntry.getName(), facetFieldEntry.getCount())
            ).toList(),
            response.getFacetField(MUTATION_ID_FIELD).getValues().stream().map(facetFieldEntry ->
                new FacetFieldDTO(facetFieldEntry.getName(), facetFieldEntry.getCount())
            ).toList(),
            response.getFacetField(EDITION_ID_FIELD).getValues().stream().map(facetFieldEntry ->
                new FacetFieldDTO(facetFieldEntry.getName(), facetFieldEntry.getCount())
            ).toList(),
            response.getFacetField(MUTATION_MARK_FIELD).getValues().stream().map(facetFieldEntry ->
                new FacetFieldDTO(facetFieldEntry.getName() != null ? facetFieldEntry.getName() : "", facetFieldEntry.getCount())
            ).sorted(Comparator.comparingLong(FacetFieldDTO::count).reversed()// sort null facet, because solr returns null facets as last
            ).toList(),
            response.getFacetField(OWNER_ID_FIELD).getValues().stream().map(facetFieldEntry ->
                new FacetFieldDTO(facetFieldEntry.getName(), facetFieldEntry.getCount())
            ).toList(),
            response.getFacetField(DAMAGE_TYPES_FIELD).getValues().stream().map(facetFieldEntry ->
                new FacetFieldDTO(facetFieldEntry.getName(), facetFieldEntry.getCount())
            ).toList()
        );

    }

    public List<Specimen> getSpecimensForVolumeDetail(String volumeId, Boolean onlyPublic) throws SolrServerException, IOException {
        return getSpecimensForVolumeDetail(volumeId, onlyPublic, false);
    }

    public List<Specimen> getSpecimensForVolumeDetail(String volumeId, Boolean onlyPublic, Boolean showAttachmentsAtTheEnd) throws SolrServerException, IOException {

        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(VOLUME_ID_FIELD + ":\"" + volumeId + "\"");
        if (onlyPublic) {
            solrQuery.addFilterQuery(NUM_EXISTS_FIELD + ":true OR " + NUM_MISSING_FIELD + ":true");
        }
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setSort(PUBLICATION_DATE_STRING_FIELD, SolrQuery.ORDER.asc);
        if (showAttachmentsAtTheEnd) {
            solrQuery.setSort(IS_ATTACHMENT_FIELD, SolrQuery.ORDER.asc);
        }
        solrQuery.setRows(100000);

        QueryResponse response = solrClient.query(SPECIMEN_CORE_NAME, solrQuery);

        return response.getBeans(Specimen.class);

    }

    public Object getSpecimensStartDate(String metaTitleId) throws SolrServerException, IOException {

        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(META_TITLE_ID_FIELD + ":\"" + metaTitleId + "\"");
        solrQuery.addFilterQuery(NUM_EXISTS_FIELD + ":true");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setParam(StatsParams.STATS, true);
        solrQuery.setParam(StatsParams.STATS_FIELD, PUBLICATION_DATE_STRING_FIELD);
        solrQuery.setRows(0);

        QueryResponse response = solrClient.query(SPECIMEN_CORE_NAME, solrQuery);

        Map<String, FieldStatsInfo> statsInfo = response.getFieldStatsInfo();

        return statsInfo.get(PUBLICATION_DATE_STRING_FIELD).getMin();

    }


    public SpecimensForVolumeOverviewStatsDTO getSpecimensForVolumeOverviewStats(String volumeId) throws SolrServerException, IOException {

        Calendar date = new GregorianCalendar();

        Calendar start = new GregorianCalendar(1700, Calendar.JANUARY, 1);
        Calendar end = new GregorianCalendar(date.get(Calendar.YEAR), Calendar.JANUARY, 1);

        Date startDate = start.getTime();
        Date endDate = end.getTime();

        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(VOLUME_ID_FIELD + ":\"" + volumeId + "\"");
        solrQuery.addFilterQuery(NUM_EXISTS_FIELD + ":true");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setParam(StatsParams.STATS, true);
        solrQuery.setParam(StatsParams.STATS_FIELD, PUBLICATION_DATE_STRING_FIELD, PAGES_COUNT_FIELD);
        solrQuery.setRows(0);
        solrQuery.setFacet(true);
        solrQuery.setParam("f." + MUTATION_MARK_FIELD + ".facet.missing", "true"); // query MUTATION_MARK_FIELD also for empty value
        solrQuery.addFacetField(MUTATION_ID_FIELD, MUTATION_MARK_FIELD, EDITION_ID_FIELD, DAMAGE_TYPES_FIELD);
        solrQuery.addDateRangeFacet(PUBLICATION_DATE_FIELD, startDate, endDate, "+1YEAR");
        solrQuery.setFacetMinCount(1);

        QueryResponse response = solrClient.query(SPECIMEN_CORE_NAME, solrQuery);

        Map<String, FieldStatsInfo> statsInfo = response.getFieldStatsInfo();

        Object publicationDayMin = statsInfo.get(PUBLICATION_DATE_STRING_FIELD).getMin();
        Object publicationDayMax = statsInfo.get(PUBLICATION_DATE_STRING_FIELD).getMax();
        Object pagesCount = statsInfo.get(PAGES_COUNT_FIELD).getSum();

        SolrQuery solrQuery2 = new SolrQuery("*:*");
        solrQuery2.addFilterQuery(VOLUME_ID_FIELD + ":\"" + volumeId + "\"");
        solrQuery2.addFilterQuery(NUM_EXISTS_FIELD + ":true OR " + NUM_MISSING_FIELD + ":true");
        solrQuery2.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery2.setRows(100000);

        QueryResponse response2 = solrClient.query(SPECIMEN_CORE_NAME, solrQuery2);
        List<Specimen> specimens = response2.getBeans(Specimen.class);

        List<FacetFieldDTO> publicationDateList = response.getFacetRanges().stream()
            .filter(rangeFacet -> PUBLICATION_DATE_FIELD.equals(rangeFacet.getName()))
            .findFirst()
            .map(rangeFacet -> (List<RangeFacet.Count>) rangeFacet.getCounts())
            .stream()
            .flatMap(counts -> counts.stream()
                .map(count -> new FacetFieldDTO(
                    count.getValue(),
                    (long) count.getCount())))
            .toList();

        return new SpecimensForVolumeOverviewStatsDTO(
            publicationDayMin,
            publicationDayMax,
            pagesCount,
            response.getFacetField(MUTATION_ID_FIELD).getValues().stream().map(facetFieldEntry ->
                new FacetFieldDTO(facetFieldEntry.getName(), facetFieldEntry.getCount())
            ).toList(),
            response.getFacetField(MUTATION_MARK_FIELD).getValues().stream().map(facetFieldEntry ->
                new FacetFieldDTO(facetFieldEntry.getName() != null ? facetFieldEntry.getName() : "", facetFieldEntry.getCount())
            ).sorted(Comparator.comparingLong(FacetFieldDTO::count).reversed()// sort null facet, because solr returns null facets as last
            ).toList(),
            response.getFacetField(EDITION_ID_FIELD).getValues().stream().map(facetFieldEntry ->
                new FacetFieldDTO(facetFieldEntry.getName(), facetFieldEntry.getCount())
            ).toList(),
            response.getFacetField(DAMAGE_TYPES_FIELD).getValues().stream().map(facetFieldEntry ->
                new FacetFieldDTO(facetFieldEntry.getName(), facetFieldEntry.getCount())
            ).toList(),
            publicationDateList,
            specimens
        );

    }

    public NamesDTO getSpecimenNamesAndSubNames() throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(NUM_EXISTS_FIELD + ":true");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setFacet(true);
        solrQuery.addFacetField(NAME_FIELD, SUB_NAME_FIELD);
        solrQuery.setFacetLimit(-1);
        solrQuery.setFacetMinCount(1);
        solrQuery.setRows(0);

        QueryResponse response = solrClient.query(SPECIMEN_CORE_NAME, solrQuery);

        return new NamesDTO(
            response.getFacetField(NAME_FIELD).getValues().stream().map(FacetField.Count::getName).toList(),
            response.getFacetField(SUB_NAME_FIELD).getValues().stream().map(FacetField.Count::getName).toList()
        );
    }


    public void createSpecimens(List<Specimen> specimens) {
        try {
            List<Specimen> specimenList = specimens.stream().peek(Specimen::prePersist).toList();

            solrClient.addBeans(SPECIMEN_CORE_NAME, specimenList);
            solrClient.commit(SPECIMEN_CORE_NAME);
            logger.info("specimens successfully created");
        } catch (Exception e) {
            throw new RuntimeException("Failed to create specimens", e);
        }
    }

    public void updateSpecimens(List<Specimen> specimens) {
        try {
            List<Specimen> specimenList = specimens.stream()
                .peek(specimen -> {
                    // If the specimen was duplicated on FE, we will call only prePersist and skip preUpdate
                    if (specimen.getCreated() == null) {
                        specimen.prePersist();
                    } else {
                        specimen.preUpdate();
                    }
                })
                .toList();

            solrClient.addBeans(SPECIMEN_CORE_NAME, specimenList);
            solrClient.commit(SPECIMEN_CORE_NAME);
            logger.info("specimens successfully updated");
        } catch (Exception e) {
            throw new RuntimeException("Failed to update specimens", e);
        }
    }

    public void deleteSpecimens(List<Specimen> specimens) {
        try {
            List<Specimen> specimenList = specimens.stream().peek(Specimen::preRemove).toList();

            solrClient.addBeans(SPECIMEN_CORE_NAME, specimenList);
            solrClient.commit(SPECIMEN_CORE_NAME);
            logger.info("specimens successfully deleted");
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete specimens", e);
        }
    }

    public Specimen getSpecimenById(String specimenId) throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(ID_FIELD + ":\"" + specimenId + "\"");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setRows(1);

        QueryResponse response = solrClient.query(SPECIMEN_CORE_NAME, solrQuery);

        List<Specimen> specimenList = response.getBeans(Specimen.class);

        if (specimenList.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        return specimenList.getFirst();
    }

    public void deleteSpecimenById(String id) throws SolrServerException, IOException {
        Specimen specimen = getSpecimenById(id);

        try {
            specimen.preRemove();

            solrClient.addBean(SPECIMEN_CORE_NAME, specimen);
            solrClient.commit(SPECIMEN_CORE_NAME);
            logger.info("specimen successfully deleted");
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete specimen", e);
        }
    }

}
