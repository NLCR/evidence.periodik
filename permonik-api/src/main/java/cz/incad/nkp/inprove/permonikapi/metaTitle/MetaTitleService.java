package cz.incad.nkp.inprove.permonikapi.metaTitle;

import cz.incad.nkp.inprove.permonikapi.metaTitle.dto.CreatableMetaTitleDTO;
import cz.incad.nkp.inprove.permonikapi.metaTitle.dto.MetaTitleOverviewDTO;
import cz.incad.nkp.inprove.permonikapi.metaTitle.mapper.CreatableMetaTitleMapper;
import cz.incad.nkp.inprove.permonikapi.specimen.SpecimenService;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

import static cz.incad.nkp.inprove.permonikapi.audit.AuditableDefinition.DELETED_FIELD;
import static cz.incad.nkp.inprove.permonikapi.config.security.user.UserProducer.getCurrentUser;

@Service
public class MetaTitleService implements MetaTitleDefinition {

    private static final Logger logger = LoggerFactory.getLogger(SpecimenService.class);

    private final SpecimenService specimenService;
    private final SolrClient solrClient;
    private final CreatableMetaTitleMapper creatableMetaTitleMapper;

    @Autowired
    public MetaTitleService(SpecimenService specimenService, SolrClient solrClient, CreatableMetaTitleMapper creatableMetaTitleMapper) {
        this.specimenService = specimenService;
        this.solrClient = solrClient;
        this.creatableMetaTitleMapper = creatableMetaTitleMapper;
    }

    public MetaTitle getMetaTitleById(String metaTitleId) throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(ID_FIELD + ":\"" + metaTitleId + "\"");

        if (getCurrentUser() == null) {
            solrQuery.addFilterQuery(IS_PUBLIC_FIELD + ":true");
        }

        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setRows(1);

        QueryResponse response = solrClient.query(META_TITLE_CORE_NAME, solrQuery);
        List<MetaTitle> metaTitleList = response.getBeans(MetaTitle.class);

        if (metaTitleList.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }

        return metaTitleList.getFirst();
    }

    public List<MetaTitle> getMetaTitles() throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setRows(100000);

        QueryResponse response = solrClient.query(META_TITLE_CORE_NAME, solrQuery);

        return response.getBeans(MetaTitle.class);
    }

    public List<MetaTitle> getAllPublicMetaTitles() throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(IS_PUBLIC_FIELD + ":true");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setRows(100000);

        QueryResponse response = solrClient.query(META_TITLE_CORE_NAME, solrQuery);

        return response.getBeans(MetaTitle.class);
    }

    public List<MetaTitleOverviewDTO> getMetaTitleOverview() throws SolrServerException, IOException {
        List<MetaTitle> metaTitles = getCurrentUser() != null ? getMetaTitles() : getAllPublicMetaTitles();
        return metaTitles
            .stream()
            .map(metaTitle -> {
                try {
                    return new MetaTitleOverviewDTO(
                        metaTitle.getId(),
                        metaTitle.getName(),
                        specimenService.getStatsForMetaTitleOverview(metaTitle.getId())
                    );
                } catch (SolrServerException | IOException e) {
                    throw new RuntimeException(e);
                }
            }).toList();
    }

    public void updateMetaTitle(String metaTitleId, MetaTitle metaTitle) throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(ID_FIELD + ":\"" + metaTitleId + "\"");
        solrQuery.setRows(1);

        QueryResponse response = solrClient.query(META_TITLE_CORE_NAME, solrQuery);

        List<MetaTitle> metaTitleList = response.getBeans(MetaTitle.class);

        if (metaTitleList.isEmpty()) {
            throw new RuntimeException("MetaTitle not found");
        }

        metaTitle.preUpdate();

        try {
            solrClient.addBean(META_TITLE_CORE_NAME, metaTitle);
            solrClient.commit(META_TITLE_CORE_NAME);
            logger.info("MetaTitle {} successfully updated", metaTitle.getId());
        } catch (Exception e) {
            throw new RuntimeException("Failed to update metaTitle", e);
        }


    }

    public void createMetaTitle(CreatableMetaTitleDTO metaTitle) throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(NAME_FIELD + ":\"" + metaTitle.name() + "\"");
        solrQuery.setRows(1);

        QueryResponse response = solrClient.query(META_TITLE_CORE_NAME, solrQuery);

        List<MetaTitle> metaTitleList = response.getBeans(MetaTitle.class);

        if (!metaTitleList.isEmpty()) {
            throw new RuntimeException("MetaTitle with this name already exists");
        }

        MetaTitle newMetaTitle = new MetaTitle();
        creatableMetaTitleMapper.createMetaTitle(metaTitle, newMetaTitle);

        newMetaTitle.prePersist();


        try {
            solrClient.addBean(META_TITLE_CORE_NAME, newMetaTitle);
            solrClient.commit(META_TITLE_CORE_NAME);
            logger.info("MetaTitle {} successfully created", metaTitle);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create metaTitle", e);
        }

    }

}
