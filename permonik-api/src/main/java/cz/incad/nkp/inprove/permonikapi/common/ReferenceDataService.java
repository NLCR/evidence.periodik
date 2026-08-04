package cz.incad.nkp.inprove.permonikapi.common;

import cz.incad.nkp.inprove.permonikapi.edition.model.Edition;
import cz.incad.nkp.inprove.permonikapi.edition.model.EditionDefinition;
import cz.incad.nkp.inprove.permonikapi.metaTitle.MetaTitle;
import cz.incad.nkp.inprove.permonikapi.metaTitle.MetaTitleDefinition;
import cz.incad.nkp.inprove.permonikapi.mutation.model.Mutation;
import cz.incad.nkp.inprove.permonikapi.mutation.model.MutationDefinition;
import cz.incad.nkp.inprove.permonikapi.owner.Owner;
import cz.incad.nkp.inprove.permonikapi.owner.OwnerDefinition;
import cz.incad.nkp.inprove.permonikapi.volume.model.Volume;
import cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition;
import lombok.RequiredArgsConstructor;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.request.SolrQuery;
import org.apache.solr.client.solrj.util.ClientUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReferenceDataService {

    private final SolrClient solrClient;

    public MetaTitle resolveMetaTitle(String id) throws SolrServerException, IOException {
        List<MetaTitle> results = queryById(MetaTitleDefinition.META_TITLE_CORE_NAME, id, MetaTitle.class);
        if (results.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "MetaTitle not found: " + id);
        }
        return results.getFirst();
    }

    public Mutation resolveMutation(String id) throws SolrServerException, IOException {
        List<Mutation> results = queryById(MutationDefinition.MUTATION_CORE_NAME, id, Mutation.class);
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
        List<Volume> results = queryById(VolumeDefinition.VOLUME_CORE_NAME, id, Volume.class);
        if (results.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Volume not found: " + id);
        }
        return results.getFirst();
    }

    private <T> List<T> queryById(String coreName, String id, Class<T> clazz) throws SolrServerException, IOException {
        SolrQuery query = new SolrQuery("*:*");
        query.addFilterQuery("id:\"" + ClientUtils.escapeQueryChars(id) + "\"");
        query.setRows(1);
        return solrClient.query(coreName, query).getBeans(clazz);
    }
}
