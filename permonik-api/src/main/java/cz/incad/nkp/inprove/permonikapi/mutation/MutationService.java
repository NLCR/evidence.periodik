package cz.incad.nkp.inprove.permonikapi.mutation;


import cz.incad.nkp.inprove.permonikapi.mutation.dto.CreatableMutationDTO;
import cz.incad.nkp.inprove.permonikapi.mutation.dto.MutationDTO;
import cz.incad.nkp.inprove.permonikapi.mutation.mapper.CreatableMutationMapper;
import cz.incad.nkp.inprove.permonikapi.mutation.mapper.MutationDTOMapper;
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

    private final MutationDTOMapper mutationDTOMapper;
    private final SolrClient solrClient;
    private final CreatableMutationMapper creatableMutationMapper;


    public List<MutationDTO> getMutations() throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        solrQuery.setRows(100000);

        QueryResponse response = solrClient.query(MUTATION_CORE_NAME, solrQuery);

        List<Mutation> mutationList = response.getBeans(Mutation.class);

        return mutationList.stream().map(mutationDTOMapper).toList();
    }

    public void updateMutation(String mutationId, Mutation mutation) throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        solrQuery.addFilterQuery(ID_FIELD + ":\"" + mutationId + "\"");
        solrQuery.setRows(1);

        QueryResponse response = solrClient.query(MUTATION_CORE_NAME, solrQuery);

        List<Mutation> mutationList = response.getBeans(Mutation.class);

        if (mutationList.isEmpty()) {
            throw new RuntimeException("Mutation not found");
        }

        try {
            solrClient.addBean(MUTATION_CORE_NAME, mutation);
            solrClient.commit(MUTATION_CORE_NAME);
            logger.info("Mutation {} successfully updated", mutation.getId());
        } catch (Exception e) {
            throw new RuntimeException("Failed to update mutation", e);
        }


    }

    public void createMutation(CreatableMutationDTO mutation) throws SolrServerException, IOException {
        SolrQuery solrQuery = new SolrQuery("*:*");
        // TODO: this filter is not working
        solrQuery.addFilterQuery(NAME_FIELD + ":\"" + mutation.name() + "\"");
        solrQuery.setRows(1);

        QueryResponse response = solrClient.query(MUTATION_CORE_NAME, solrQuery);

        List<Mutation> mutationList = response.getBeans(Mutation.class);

        if (!mutationList.isEmpty()) {
            throw new RuntimeException("Mutation with this name already exists");
        }

        Mutation newMutation = new Mutation();
        creatableMutationMapper.createMutation(mutation, newMutation);


        try {
            solrClient.addBean(MUTATION_CORE_NAME, newMutation);
            solrClient.commit(MUTATION_CORE_NAME);
            logger.info("Mutation {} successfully created", mutation);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create mutation", e);
        }

    }
}
