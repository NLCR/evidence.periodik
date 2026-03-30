package cz.incad.nkp.inprove.permonikapi.specimen;

import com.fasterxml.jackson.databind.ObjectMapper;
import cz.incad.nkp.inprove.permonikapi.common.ReferenceDataService;
import cz.incad.nkp.inprove.permonikapi.edition.model.Edition;
import cz.incad.nkp.inprove.permonikapi.mutation.model.Mutation;
import cz.incad.nkp.inprove.permonikapi.owner.Owner;
import cz.incad.nkp.inprove.permonikapi.specimen.dto.*;
import cz.incad.nkp.inprove.permonikapi.specimen.enums.SpecimenTableViewEnum;
import cz.incad.nkp.inprove.permonikapi.specimen.model.Specimen;
import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDTO;
import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDefinition;
import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenMapper;
import cz.incad.nkp.inprove.permonikapi.volume.enums.AttachmentsSortEnum;
import cz.incad.nkp.inprove.permonikapi.volume.model.Volume;
import lombok.RequiredArgsConstructor;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.request.SolrQuery;
import org.apache.solr.client.solrj.response.*;
import org.apache.solr.client.solrj.util.ClientUtils;
import org.apache.solr.common.params.GroupParams;
import org.apache.solr.common.params.StatsParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

import java.util.*;
import java.util.stream.Collectors;

import static cz.incad.nkp.inprove.permonikapi.audit.AuditableDefinition.DELETED_FIELD;
import static cz.incad.nkp.inprove.permonikapi.utils.DateValidator.isValidDate;

@Service
@RequiredArgsConstructor
public class SpecimenService implements SpecimenDefinition {

    private static final Logger logger = LoggerFactory.getLogger(SpecimenService.class);

    private final SolrClient solrClient;
    private final SpecimenMapper specimenMapper;
    private final ObjectMapper objectMapper;
    private final ReferenceDataService referenceDataService;


    public StatsForMetaTitleOverviewDTO getStatsForMetaTitleOverview(String metaTitleId) throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.setFilterQueries(META_TITLE_ID_FIELD + ":\"" + ClientUtils.escapeQueryChars(metaTitleId) + "\"", NUM_EXISTS_FIELD + ":true");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setParam(StatsParams.STATS, true);
        solrQuery.setParam(StatsParams.STATS_FIELD, MUTATION_ID_FIELD, PUBLICATION_DATE_FIELD, OWNER_ID_FIELD);
        solrQuery.setParam(StatsParams.STATS_CALC_DISTINCT, true);
        solrQuery.setParam(GroupParams.GROUP, true);
        solrQuery.setParam(GroupParams.GROUP_FIELD, META_TITLE_ID_FIELD);
        solrQuery.setParam(GroupParams.GROUP_LIMIT, "1");
        solrQuery.setParam(GroupParams.GROUP_TOTAL_COUNT, true);
        solrQuery.setRows(0);

        QueryResponse response = solrClient.query(SPECIMEN_CORE_NAME, solrQuery);

        Map<String, FieldStatsInfo> statsInfo = response.getFieldStatsInfo();

        FieldStatsInfo mutationsStats = statsInfo.get(MUTATION_ID_FIELD);
        FieldStatsInfo publicationDayStats = statsInfo.get(PUBLICATION_DATE_FIELD);
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


    public SpecimensOverviewDTO getSpecimensOverview(String metaTitleId, Integer offset, Integer rows, String facets, SpecimenTableViewEnum view, String lang) throws IOException, SolrServerException {

        Integer localRows = rows;

        SpecimenFacets specimenFacets = objectMapper.readValue(facets, SpecimenFacets.class);

        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.setFilterQueries(META_TITLE_ID_FIELD + ":\"" + ClientUtils.escapeQueryChars(metaTitleId) + "\"");
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

        if (Objects.equals(view, SpecimenTableViewEnum.TABLE) && !specimenFacets.getSpecimenStates().isEmpty()) {
            solrQuery.addFilterQuery(specimenFacets.getSpecimenStatesQueryString());
        } else {
            solrQuery.addFilterQuery(NUM_EXISTS_FIELD + ":true");
        }

        // Add filtering based on year interval
        if (Objects.equals(view, SpecimenTableViewEnum.TABLE) && specimenFacets.getDateStart() != null && specimenFacets.getDateEnd() != null) {
            solrQuery.addFilterQuery(PUBLICATION_DATE_FIELD + ":[" + specimenFacets.getDateStart().toInstant() + " TO *]");
            solrQuery.addFilterQuery(PUBLICATION_DATE_FIELD + ":[* TO " + specimenFacets.getDateEnd().toInstant() + "]");
        }

        if (Objects.equals(view, SpecimenTableViewEnum.CALENDAR) && specimenFacets.getCalendarDateStart() != null && !specimenFacets.getCalendarDateStart().isEmpty()) {
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
        solrQuery.setSort(PUBLICATION_DATE_FIELD, SolrQuery.ORDER.asc);
        solrQuery.addSort(editionSortField(lang), SolrQuery.ORDER.asc);

        QueryResponse response = solrClient.query(SPECIMEN_CORE_NAME, solrQuery);
        List<Specimen> specimenList = response.getBeans(Specimen.class);

        List<String> ownerList = specimenList.stream()
            .map(Specimen::getOwnerId)
            .collect(Collectors.toSet()).stream().toList();

        List<SpecimenOverviewDTO> specimenDTOList = specimenList.stream().map(specimenMapper::toSpecimenOverviewDTO).toList();

        SolrQuery statsQuery = new SolrQuery("*:*");
        statsQuery.setFilterQueries(META_TITLE_ID_FIELD + ":\"" + ClientUtils.escapeQueryChars(metaTitleId) + "\"", NUM_EXISTS_FIELD + ":true");
        statsQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        statsQuery.setRows(0);
        statsQuery.setParam(StatsParams.STATS, true);
        statsQuery.setParam(StatsParams.STATS_FIELD, PUBLICATION_DATE_FIELD);

        QueryResponse statsResponse = solrClient.query(SPECIMEN_CORE_NAME, statsQuery);

        Map<String, FieldStatsInfo> statsInfo = statsResponse.getFieldStatsInfo();
        FieldStatsInfo publicationDayStats = statsInfo.get(PUBLICATION_DATE_FIELD);

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

        return new SpecimensOverviewDTO(
            specimenDTOList,
            publicationDayMax,
            publicationDayMin,
            groupedSpecimens,
            ownerList
        );

    }

    public FacetsDTO getSpecimensFacets(String metaTitleId, String facets, SpecimenTableViewEnum view) throws IOException, SolrServerException {

        SpecimenFacets specimenFacets = objectMapper.readValue(facets, SpecimenFacets.class);

        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.setFilterQueries(META_TITLE_ID_FIELD + ":\"" + ClientUtils.escapeQueryChars(metaTitleId) + "\"");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setRows(0);
        solrQuery.setStart(0);
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

        if (Objects.equals(view, SpecimenTableViewEnum.TABLE) && !specimenFacets.getSpecimenStates().isEmpty()) {
            solrQuery.addFilterQuery(specimenFacets.getSpecimenStatesQueryString());
        } else {
            solrQuery.addFilterQuery(NUM_EXISTS_FIELD + ":true");
        }

        // Add filtering based on year interval for table view
        if (Objects.equals(view, SpecimenTableViewEnum.TABLE) && specimenFacets.getDateStart() != null && specimenFacets.getDateEnd() != null) {
            solrQuery.addFilterQuery(PUBLICATION_DATE_FIELD + ":[" + specimenFacets.getDateStart().toInstant() + " TO *]");
            solrQuery.addFilterQuery(PUBLICATION_DATE_FIELD + ":[* TO " + specimenFacets.getDateEnd().toInstant() + "]");
        }

        // Add filtering based on year interval for calendar view
        if (Objects.equals(view, SpecimenTableViewEnum.CALENDAR) && specimenFacets.getCalendarDateStart() != null && !specimenFacets.getCalendarDateStart().isEmpty()) {
            if (isValidDate(specimenFacets.getCalendarDateStart())) {
                // getCalendarDateStart -> format: 1953-01-01T00:00:00.000Z -> [1953-01-01T00:00:00.000Z TO *]
                solrQuery.addFilterQuery(PUBLICATION_DATE_FIELD + ":[" + specimenFacets.getCalendarDateStart() + " TO *]");
                solrQuery.addFilterQuery(PUBLICATION_DATE_FIELD + ":[* TO " + specimenFacets.getCalendarDateEnd() + "]");
            }
        }

//        logger.info("SOLR QUERY: {}", solrQuery.toQueryString());
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
            response.getFacetField(MUTATION_MARK_FIELD).getValues().stream().filter(f -> f.getCount() > 0).map(facetFieldEntry ->
                new FacetFieldDTO(facetFieldEntry.getName() != null ? facetFieldEntry.getName() : "", facetFieldEntry.getCount())
            ).sorted(Comparator.comparingLong(FacetFieldDTO::count).reversed() // sort null facet, because solr returns null facets as last
            ).toList(),
            response.getFacetField(OWNER_ID_FIELD).getValues().stream().map(facetFieldEntry ->
                new FacetFieldDTO(facetFieldEntry.getName(), facetFieldEntry.getCount())
            ).toList(),
            response.getFacetField(DAMAGE_TYPES_FIELD).getValues().stream().map(facetFieldEntry ->
                new FacetFieldDTO(facetFieldEntry.getName(), facetFieldEntry.getCount())
            ).toList()
        );

    }

    public List<SpecimenDTO> getSpecimensForVolumeDetail(String volumeId, Boolean onlyPublic) throws SolrServerException, IOException {
        return getSpecimensForVolumeDetail(volumeId, onlyPublic, AttachmentsSortEnum.NONE);
    }

    public List<SpecimenDTO> getSpecimensForVolumeDetail(String volumeId, Boolean onlyPublic, AttachmentsSortEnum attachmentsSort) throws SolrServerException, IOException {

        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(VOLUME_ID_FIELD + ":\"" + ClientUtils.escapeQueryChars(volumeId) + "\"");
        if (onlyPublic) {
            solrQuery.addFilterQuery(NUM_EXISTS_FIELD + ":true OR " + NUM_MISSING_FIELD + ":true");
        }
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setSort(PUBLICATION_DATE_FIELD, SolrQuery.ORDER.asc);
        if (Objects.equals(attachmentsSort, AttachmentsSortEnum.ASC)) {
            solrQuery.setSort(IS_ATTACHMENT_FIELD, SolrQuery.ORDER.asc);
        }
        if (Objects.equals(attachmentsSort, AttachmentsSortEnum.DESC)) {
            solrQuery.setSort(IS_ATTACHMENT_FIELD, SolrQuery.ORDER.desc);
        }
        solrQuery.setRows(100000);

        QueryResponse response = solrClient.query(SPECIMEN_CORE_NAME, solrQuery);

        return response.getBeans(Specimen.class).stream().map(specimenMapper::toDTO).toList();

    }

    public Object getSpecimensStartDate(String metaTitleId) throws SolrServerException, IOException {

        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(META_TITLE_ID_FIELD + ":\"" + ClientUtils.escapeQueryChars(metaTitleId) + "\"");
        solrQuery.addFilterQuery(NUM_EXISTS_FIELD + ":true");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setParam(StatsParams.STATS, true);
        solrQuery.setParam(StatsParams.STATS_FIELD, PUBLICATION_DATE_FIELD);
        solrQuery.setRows(0);

        QueryResponse response = solrClient.query(SPECIMEN_CORE_NAME, solrQuery);

        Map<String, FieldStatsInfo> statsInfo = response.getFieldStatsInfo();

        return statsInfo.get(PUBLICATION_DATE_FIELD).getMin();

    }


    public SpecimensForVolumeOverviewStatsDTO getSpecimensForVolumeOverviewStats(String volumeId) throws SolrServerException, IOException {

        Calendar date = new GregorianCalendar();

        Calendar start = new GregorianCalendar(1700, Calendar.JANUARY, 1);
        Calendar end = new GregorianCalendar(date.get(Calendar.YEAR), Calendar.JANUARY, 1);

        Date startDate = start.getTime();
        Date endDate = end.getTime();

        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(VOLUME_ID_FIELD + ":\"" + ClientUtils.escapeQueryChars(volumeId) + "\"");
        solrQuery.addFilterQuery(NUM_EXISTS_FIELD + ":true");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setParam(StatsParams.STATS, true);
        solrQuery.setParam(StatsParams.STATS_FIELD, PUBLICATION_DATE_FIELD, PAGES_COUNT_FIELD);
        solrQuery.setRows(0);
        solrQuery.setFacet(true);
        solrQuery.setParam("f." + MUTATION_MARK_FIELD + ".facet.missing", "true"); // query MUTATION_MARK_FIELD also for empty value
        solrQuery.addFacetField(MUTATION_ID_FIELD, MUTATION_MARK_FIELD, EDITION_ID_FIELD, DAMAGE_TYPES_FIELD);
        solrQuery.addDateRangeFacet(PUBLICATION_DATE_FIELD, startDate, endDate, "+1YEAR");
        solrQuery.setFacetMinCount(1);

        QueryResponse response = solrClient.query(SPECIMEN_CORE_NAME, solrQuery);

        Map<String, FieldStatsInfo> statsInfo = response.getFieldStatsInfo();

        Object publicationDayMin = statsInfo.get(PUBLICATION_DATE_FIELD).getMin();
        Object publicationDayMax = statsInfo.get(PUBLICATION_DATE_FIELD).getMax();
        Object pagesCount = statsInfo.get(PAGES_COUNT_FIELD).getSum();

        SolrQuery solrQuery2 = new SolrQuery("*:*");
        solrQuery2.addFilterQuery(VOLUME_ID_FIELD + ":\"" + ClientUtils.escapeQueryChars(volumeId) + "\"");
        solrQuery2.addFilterQuery(NUM_EXISTS_FIELD + ":true OR " + NUM_MISSING_FIELD + ":true");
        solrQuery2.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery2.setSort(PUBLICATION_DATE_FIELD, SolrQuery.ORDER.asc);
        solrQuery2.setRows(100000);

        QueryResponse response2 = solrClient.query(SPECIMEN_CORE_NAME, solrQuery2);
        List<Specimen> specimens = response2.getBeans(Specimen.class);

        List<FacetFieldDTO> publicationDateList = response.getFacetRanges().stream()
            .filter(rangeFacet -> PUBLICATION_DATE_FIELD.equals(rangeFacet.getName()))
            .findFirst()
            .map(rangeFacet -> (List<RangeFacet.Count>) rangeFacet.getCounts()) // SolrJ returns raw List
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
            response.getFacetField(MUTATION_MARK_FIELD).getValues().stream().filter(f -> f.getCount() > 0).map(facetFieldEntry ->
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
            specimens.stream().map(specimenMapper::toDTO).toList()
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


    public void createSpecimens(List<SpecimenDTO> specimens) {
        try {
            List<Specimen> specimenList = specimens.stream()
                .peek(SpecimenDTO::prePersist)
                .map(specimenMapper::toModel)
                .toList();
            resolveSpecimenReferenceNames(specimenList, specimens);
            solrClient.addBeans(SPECIMEN_CORE_NAME, specimenList);
            solrClient.commit(SPECIMEN_CORE_NAME);
            logger.info("specimens successfully created");
        } catch (Exception e) {
            throw new RuntimeException("Failed to create specimens", e);
        }
    }

    public void updateSpecimens(List<SpecimenDTO> specimens) {
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
                .map(specimenMapper::toModel)
                .toList();
            resolveSpecimenReferenceNames(specimenList, specimens);
            solrClient.addBeans(SPECIMEN_CORE_NAME, specimenList);
            solrClient.commit(SPECIMEN_CORE_NAME);
            logger.info("specimens successfully updated");
        } catch (Exception e) {
            throw new RuntimeException("Failed to update specimens", e);
        }
    }

    private void resolveSpecimenReferenceNames(List<Specimen> specimenList, List<SpecimenDTO> dtos) {
        // Cache per unique ID to avoid redundant Solr queries within the same batch
        Map<String, Volume> volumeCache = new HashMap<>();
        Map<String, Mutation> mutationCache = new HashMap<>();
        Map<String, Owner> ownerCache = new HashMap<>();
        Map<String, Edition> editionCache = new HashMap<>();

        for (int i = 0; i < specimenList.size(); i++) {
            Specimen specimen = specimenList.get(i);
            SpecimenDTO dto = dtos.get(i);

            // metaTitleId, metaTitleName, barCode and ownerId come from the volume (not present in SpecimenDTO)
            String volumeId = dto.getVolumeId();
            Volume volume = volumeCache.computeIfAbsent(volumeId, id -> {
                try {
                    return referenceDataService.resolveVolume(id);
                } catch (Exception e) {
                    throw new RuntimeException("Failed to resolve volume: " + id, e);
                }
            });
            specimen.setMetaTitleId(volume.getMetaTitleId());
            specimen.setMetaTitleName(volume.getMetaTitleName());
            specimen.setBarCode(volume.getBarCode());
            specimen.setOwnerId(volume.getOwnerId());

            Owner owner = ownerCache.computeIfAbsent(volume.getOwnerId(), id -> {
                try {
                    return referenceDataService.resolveOwner(id);
                } catch (Exception e) {
                    throw new RuntimeException("Failed to resolve owner: " + id, e);
                }
            });
            specimen.setOwnerName(owner.getName());

            Mutation mutation = mutationCache.computeIfAbsent(dto.getMutationId(), id -> {
                try {
                    return referenceDataService.resolveMutation(id);
                } catch (Exception e) {
                    throw new RuntimeException("Failed to resolve mutation: " + id, e);
                }
            });
            specimen.setMutationCsName(mutation.getNameCs());
            specimen.setMutationSkName(mutation.getNameSk());
            specimen.setMutationEnName(mutation.getNameEn());

            Edition edition = editionCache.computeIfAbsent(dto.getEditionId(), id -> {
                try {
                    return referenceDataService.resolveEdition(id);
                } catch (Exception e) {
                    throw new RuntimeException("Failed to resolve edition: " + id, e);
                }
            });
            specimen.setEditionCsName(edition.getNameCs());
            specimen.setEditionSkName(edition.getNameSk());
            specimen.setEditionEnName(edition.getNameEn());
        }
    }

    private String editionSortField(String lang) {
        return switch (lang) {
            case "sk" -> EDITION_SK_SORT_FIELD;
            case "en" -> EDITION_EN_SORT_FIELD;
            default -> EDITION_CS_SORT_FIELD;
        };
    }

    public void deleteSpecimens(List<SpecimenDTO> specimens) {
        try {
            List<Specimen> specimenList = specimens.stream().peek(SpecimenDTO::preRemove).map(specimenMapper::toModel).toList();

            solrClient.addBeans(SPECIMEN_CORE_NAME, specimenList);
            solrClient.commit(SPECIMEN_CORE_NAME);
            logger.info("specimens successfully deleted");
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete specimens", e);
        }
    }

    public Specimen getSpecimenById(String specimenId) throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(ID_FIELD + ":\"" + ClientUtils.escapeQueryChars(specimenId) + "\"");
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
