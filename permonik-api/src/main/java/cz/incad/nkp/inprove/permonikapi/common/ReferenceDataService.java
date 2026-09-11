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
import org.apache.solr.common.SolrException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.List;
import java.util.Collection;
import java.util.stream.Collectors;
import org.apache.solr.client.solrj.response.QueryResponse;
import static cz.incad.nkp.inprove.permonikapi.audit.AuditableDefinition.DELETED_FIELD;
import static cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition.DATE_FROM_FIELD;
import static cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition.DATE_TO_FIELD;
import static cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition.ID_FIELD;
import static cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition.META_TITLE_ID_FIELD;
import static cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition.MUTATION_ID_FIELD;
import static cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition.MUTATION_MARK_FIELD;
import static cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition.MUTATION_MARK_TYPE_FIELD;
import static cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition.OWNER_ID_FIELD;
import static cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition.VOLUME_CORE_NAME;

@Service
@RequiredArgsConstructor
public class ReferenceDataService {

    private final SolrClient solrClient;

    /** Escapes an exact stored string value instead of accepting caller-supplied Solr syntax. */
    private static String exact(String field, String value) {
        return field + ":\"" + ClientUtils.escapeQueryChars(value) + "\"";
    }

    /** Searches active same-title volumes with inclusive UTC-day overlap and optional source equality filters. */
    public ReplacementPage searchReplacementVolumes(Volume primary, boolean matchOwner, boolean matchMutation,
                                                    boolean matchEdition, int pageSize, String pageToken)
            throws SolrServerException, IOException {
        var from = primary.getDateFrom().toInstant().atZone(ZoneOffset.UTC).toLocalDate();
        var to = primary.getDateTo().toInstant().atZone(ZoneOffset.UTC).toLocalDate();
        SolrQuery query = new SolrQuery("*:*");
        query.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        query.addFilterQuery("-" + exact(ID_FIELD, primary.getId()));
        query.addFilterQuery(exact(META_TITLE_ID_FIELD, primary.getMetaTitleId()));
        query.addFilterQuery(DATE_FROM_FIELD + ":[* TO " + to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant() + "}");
        query.addFilterQuery(DATE_TO_FIELD + ":[" + from.atStartOfDay(ZoneOffset.UTC).toInstant() + " TO *]");
        if (matchOwner) query.addFilterQuery(exact(OWNER_ID_FIELD, primary.getOwnerId()));
        if (matchMutation) query.addFilterQuery(exact(MUTATION_ID_FIELD, primary.getMutationId()));
        if (matchEdition) {
            query.addFilterQuery(exact(MUTATION_MARK_TYPE_FIELD, primary.getMutationMarkType()));
            query.addFilterQuery(primary.rawMutationMark() == null
                    ? "-" + MUTATION_MARK_FIELD + ":[* TO *]" : exact(MUTATION_MARK_FIELD, primary.rawMutationMark()));
        }
        query.setRows(pageSize);
        query.setSort(ID_FIELD, SolrQuery.ORDER.asc);
        String prefix = query + "\n";
        String cursor = "*";
        if (!pageToken.isEmpty()) {
            String decoded = new String(Base64.getUrlDecoder().decode(pageToken), StandardCharsets.UTF_8);
            if (!decoded.startsWith(prefix) || decoded.length() == prefix.length()) {
                throw new IllegalArgumentException("Page token does not match the search");
            }
            cursor = decoded.substring(prefix.length());
        }
        query.set("cursorMark", cursor);
        QueryResponse response;
        try {
            response = solrClient.query(VOLUME_CORE_NAME, query);
        } catch (SolrException exception) {
            if (exception.code() == 400) throw new IllegalArgumentException("Invalid search page token", exception);
            throw exception;
        }
        String next = response.getNextCursorMark();
        if (next == null || (response.getHeader() != null && response.getHeader().get("partialResults") != null
                && !"false".equals(response.getHeader().get("partialResults").toString()))) {
            throw new SolrServerException("Incomplete replacement search response");
        }
        String token = cursor.equals(next) ? "" : Base64.getUrlEncoder().withoutPadding()
                .encodeToString((prefix + next).getBytes(StandardCharsets.UTF_8));
        return new ReplacementPage(response.getBeans(Volume.class), token);
    }

    /** Loads complete active volumes in one escaped ID query and rejects incomplete Solr responses. */
    public List<Volume> getVolumesByIds(Collection<String> ids) throws SolrServerException, IOException {
        if (ids.isEmpty()) return List.of();
        SolrQuery query = new SolrQuery("*:*");
        query.addFilterQuery("id:(" + ids.stream().map(id -> "\"" + ClientUtils.escapeQueryChars(id) + "\"")
                .collect(Collectors.joining(" OR ")) + ")");
        query.addFilterQuery("-" + DELETED_FIELD + ":[* TO *]");
        query.setRows(ids.size());
        QueryResponse response = solrClient.query(VolumeDefinition.VOLUME_CORE_NAME, query);
        List<Volume> beans = response.getBeans(Volume.class);
        if (response.getResults().getNumFound() != beans.size() ||
                (response.getHeader() != null && response.getHeader().get("partialResults") != null &&
                        !"false".equals(response.getHeader().get("partialResults").toString()))) {
            throw new SolrServerException("Incomplete reference query response");
        }
        return beans;
    }

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

    public record ReplacementPage(List<Volume> volumes, String nextPageToken) {}
}
