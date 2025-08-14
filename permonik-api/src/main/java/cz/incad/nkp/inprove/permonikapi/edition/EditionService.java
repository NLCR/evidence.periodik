package cz.incad.nkp.inprove.permonikapi.edition;


import cz.incad.nkp.inprove.permonikapi.edition.dto.CreatableEditionDTO;
import cz.incad.nkp.inprove.permonikapi.edition.dto.EditionDTO;
import cz.incad.nkp.inprove.permonikapi.edition.mapper.CreatableEditionMapper;
import cz.incad.nkp.inprove.permonikapi.edition.mapper.EditionDTOMapper;
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

    private final EditionDTOMapper editionDTOMapper;
    private final SolrClient solrClient;
    private final CreatableEditionMapper creatableEditionMapper;


    public List<EditionDTO> getEditions() throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setRows(100000);

        QueryResponse response = solrClient.query(EDITION_CORE_NAME, solrQuery);

        List<Edition> editionList = response.getBeans(Edition.class);

        return editionList.stream().map(editionDTOMapper).toList();
    }

    public void updateEdition(String editionId, Edition edition) throws SolrServerException, IOException {
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
            solrClient.addBean(EDITION_CORE_NAME, edition);
            solrClient.commit(EDITION_CORE_NAME);
            logger.info("Edition {} successfully updated", edition.getId());
        } catch (Exception e) {
            throw new RuntimeException("Failed to update edition", e);
        }


    }

    public void createEdition(CreatableEditionDTO edition) throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        // TODO: this filter is not working
        solrQuery.addFilterQuery(NAME_FIELD + ":\"" + edition.name() + "\"");
        solrQuery.setRows(1);

        QueryResponse response = solrClient.query(EDITION_CORE_NAME, solrQuery);

        List<Edition> editionList = response.getBeans(Edition.class);

        if (!editionList.isEmpty()) {
            throw new RuntimeException("Edition with this name already exists");
        }

        Edition newEdition = new Edition();
        creatableEditionMapper.createEdition(edition, newEdition);

        newEdition.prePersist();


        try {
            solrClient.addBean(EDITION_CORE_NAME, newEdition);
            solrClient.commit(EDITION_CORE_NAME);
            logger.info("Edition {} successfully created", edition);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create edition", e);
        }

    }

}
