package cz.incad.nkp.inprove.permonikapi.mutation;


import cz.incad.nkp.inprove.permonikapi.mutation.model.Mutation;
import cz.incad.nkp.inprove.permonikapi.mutation.model.MutationDTO;
import cz.incad.nkp.inprove.permonikapi.mutation.model.MutationMapper;
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
public class MutationService implements MutationDefinition {

    private static final Logger logger = LoggerFactory.getLogger(MutationService.class);

    private final MutationMapper mutationMapper;
    private final SolrClient solrClient;


    public List<MutationDTO> getMutations() throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setRows(100000);

        QueryResponse response = solrClient.query(MUTATION_CORE_NAME, solrQuery);

        return response.getBeans(Mutation.class).stream().map(mutationMapper::toDTO).toList();
    }

    public void updateMutation(String mutationId, MutationDTO mutation) throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(ID_FIELD + ":\"" + mutationId + "\"");
        solrQuery.setRows(1);

        QueryResponse response = solrClient.query(MUTATION_CORE_NAME, solrQuery);

        List<Mutation> mutationList = response.getBeans(Mutation.class);

        if (mutationList.isEmpty()) {
            throw new RuntimeException("Mutation not found");
        }

        mutation.preUpdate();

        try {
            solrClient.addBean(MUTATION_CORE_NAME, mutationMapper.toModel(mutation));
            solrClient.commit(MUTATION_CORE_NAME);
            logger.info("Mutation {} successfully updated", mutation.getId());
        } catch (Exception e) {
            throw new RuntimeException("Failed to update mutation", e);
        }


    }

    public void createMutation(MutationDTO mutation) throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        // TODO: this filter is not working
        solrQuery.addFilterQuery(NAME_FIELD + ":\"" + mutation.getName() + "\"");
        solrQuery.setRows(1);

        QueryResponse response = solrClient.query(MUTATION_CORE_NAME, solrQuery);

        List<Mutation> mutationList = response.getBeans(Mutation.class);

        if (!mutationList.isEmpty()) {
            throw new RuntimeException("Mutation with this name already exists");
        }

        mutation.prePersist();

        try {
            solrClient.addBean(MUTATION_CORE_NAME, mutationMapper.toModel(mutation));
            solrClient.commit(MUTATION_CORE_NAME);
            logger.info("Mutation {} successfully created", mutation);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create mutation", e);
        }

    }
}
