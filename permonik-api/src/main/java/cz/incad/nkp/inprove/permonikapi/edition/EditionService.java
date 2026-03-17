package cz.incad.nkp.inprove.permonikapi.edition;


import cz.incad.nkp.inprove.permonikapi.edition.model.Edition;
import cz.incad.nkp.inprove.permonikapi.edition.model.EditionDTO;
import cz.incad.nkp.inprove.permonikapi.edition.model.EditionMapper;
import lombok.RequiredArgsConstructor;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrQuery;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

import static cz.incad.nkp.inprove.permonikapi.audit.AuditableDefinition.DELETED_FIELD;

@Service
@RequiredArgsConstructor
public class EditionService implements EditionDefinition {

    private static final Logger logger = LoggerFactory.getLogger(EditionService.class);

    private final EditionMapper editionMapper;
    private final SolrClient solrClient;


    public List<EditionDTO> getEditions() throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setRows(100000);

        QueryResponse response = solrClient.query(EDITION_CORE_NAME, solrQuery);

        return response.getBeans(Edition.class).stream().map(editionMapper::toDTO).toList();
    }

    public void updateEdition(String editionId, EditionDTO edition) throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(ID_FIELD + ":\"" + editionId + "\"");
        solrQuery.setRows(1);
        // TODO: handle is isAttachment changes -> volume and specimens data or make it not changeable
        QueryResponse response = solrClient.query(EDITION_CORE_NAME, solrQuery);

        List<Edition> editionList = response.getBeans(Edition.class);

        if (editionList.isEmpty()) {
            throw new RuntimeException("Edition not found");
        }

        edition.preUpdate();

        try {
            solrClient.addBean(EDITION_CORE_NAME, editionMapper.toModel(edition));
            solrClient.commit(EDITION_CORE_NAME);
            logger.info("Edition {} successfully updated", edition.getId());
        } catch (Exception e) {
            throw new RuntimeException("Failed to update edition", e);
        }


    }

    public void createEdition(EditionDTO edition) throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        // TODO: this filter is not working
        solrQuery.addFilterQuery(NAME_FIELD + ":\"" + edition.getName() + "\"");
        solrQuery.setRows(1);

        QueryResponse response = solrClient.query(EDITION_CORE_NAME, solrQuery);

        List<Edition> editionList = response.getBeans(Edition.class);

        if (!editionList.isEmpty()) {
            throw new RuntimeException("Edition with this name already exists");
        }

        edition.prePersist();

        try {
            solrClient.addBean(EDITION_CORE_NAME, editionMapper.toModel(edition));
            solrClient.commit(EDITION_CORE_NAME);
            logger.info("Edition {} successfully created", edition);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create edition", e);
        }

    }

}
