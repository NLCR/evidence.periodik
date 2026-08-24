package cz.incad.nkp.inprove.permonikapi.common;

import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDefinition;
import cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition;
import lombok.RequiredArgsConstructor;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrServerException;
import org.apache.solr.client.solrj.request.SolrQuery;
import org.apache.solr.client.solrj.util.ClientUtils;
import org.apache.solr.common.SolrInputDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DenormalizationService {

    private static final Logger logger = LoggerFactory.getLogger(DenormalizationService.class);

    private final SolrClient solrClient;

    public void updateEditionInSpecimens(String editionId, String nameCz, String nameSk, String nameEn) throws SolrServerException, IOException {
        atomicUpdate(
            SpecimenDefinition.SPECIMEN_CORE_NAME,
            fetchIds(SpecimenDefinition.SPECIMEN_CORE_NAME, SpecimenDefinition.EDITION_ID_FIELD, editionId),
            Map.of(
                SpecimenDefinition.EDITION_CS_NAME_FIELD, nameCz,
                SpecimenDefinition.EDITION_SK_NAME_FIELD, nameSk,
                SpecimenDefinition.EDITION_EN_NAME_FIELD, nameEn
            )
        );
    }

    public void updateMutationInVolumes(String mutationId, String nameCz, String nameSk, String nameEn) throws SolrServerException, IOException {
        atomicUpdate(
            VolumeDefinition.VOLUME_CORE_NAME,
            fetchIds(VolumeDefinition.VOLUME_CORE_NAME, VolumeDefinition.MUTATION_ID_FIELD, mutationId),
            Map.of(
                VolumeDefinition.MUTATION_CS_NAME_FIELD, nameCz,
                VolumeDefinition.MUTATION_SK_NAME_FIELD, nameSk,
                VolumeDefinition.MUTATION_EN_NAME_FIELD, nameEn
            )
        );
    }

    public void updateMutationInSpecimens(String mutationId, String nameCz, String nameSk, String nameEn) throws SolrServerException, IOException {
        atomicUpdate(
            SpecimenDefinition.SPECIMEN_CORE_NAME,
            fetchIds(SpecimenDefinition.SPECIMEN_CORE_NAME, SpecimenDefinition.MUTATION_ID_FIELD, mutationId),
            Map.of(
                SpecimenDefinition.MUTATION_CS_NAME_FIELD, nameCz,
                SpecimenDefinition.MUTATION_SK_NAME_FIELD, nameSk,
                SpecimenDefinition.MUTATION_EN_NAME_FIELD, nameEn
            )
        );
    }

    public void updateOwnerInVolumes(String ownerId, String name, String shorthand, String sigla) throws SolrServerException, IOException {
        atomicUpdate(
            VolumeDefinition.VOLUME_CORE_NAME,
            fetchIds(VolumeDefinition.VOLUME_CORE_NAME, VolumeDefinition.OWNER_ID_FIELD, ownerId),
            Map.of(
                VolumeDefinition.OWNER_NAME_FIELD, name,
                VolumeDefinition.OWNER_SHORTHAND_FIELD, shorthand,
                VolumeDefinition.OWNER_SIGLA_FIELD, sigla
            )
        );
    }

    public void updateOwnerInSpecimens(String ownerId, String name, String shorthand, String sigla) throws SolrServerException, IOException {
        atomicUpdate(
            SpecimenDefinition.SPECIMEN_CORE_NAME,
            fetchIds(SpecimenDefinition.SPECIMEN_CORE_NAME, SpecimenDefinition.OWNER_ID_FIELD, ownerId),
            Map.of(
                SpecimenDefinition.OWNER_NAME_FIELD, name,
                SpecimenDefinition.OWNER_SHORTHAND_FIELD, shorthand,
                SpecimenDefinition.OWNER_SIGLA_FIELD, sigla
            )
        );
    }

    public void updateMetaTitleInVolumes(String metaTitleId, String name) throws SolrServerException, IOException {
        atomicUpdate(
            VolumeDefinition.VOLUME_CORE_NAME,
            fetchIds(VolumeDefinition.VOLUME_CORE_NAME, VolumeDefinition.META_TITLE_ID_FIELD, metaTitleId),
            Map.of(VolumeDefinition.META_TITLE_NAME_FIELD, name)
        );
    }

    public void updateMetaTitleInSpecimens(String metaTitleId, String name) throws SolrServerException, IOException {
        atomicUpdate(
            SpecimenDefinition.SPECIMEN_CORE_NAME,
            fetchIds(SpecimenDefinition.SPECIMEN_CORE_NAME, SpecimenDefinition.META_TITLE_ID_FIELD, metaTitleId),
            Map.of(SpecimenDefinition.META_TITLE_NAME_FIELD, name)
        );
    }

    private List<String> fetchIds(String coreName, String filterField, String filterId) throws SolrServerException, IOException {
        SolrQuery query = new SolrQuery("*:*");
        query.addFilterQuery(filterField + ":\"" + ClientUtils.escapeQueryChars(filterId) + "\"");
        query.setFields("id");
        query.setRows(100000);

        return solrClient.query(coreName, query).getResults().stream()
            .map(doc -> (String) doc.getFieldValue("id"))
            .toList();
    }

    private void atomicUpdate(String coreName, List<String> ids, Map<String, Object> fieldUpdates) throws SolrServerException, IOException {
        if (ids.isEmpty()) {
            return;
        }

        List<SolrInputDocument> docs = ids.stream().map(id -> {
            SolrInputDocument doc = new SolrInputDocument();
            doc.addField("id", id);
            fieldUpdates.forEach((field, value) -> doc.addField(field, Map.of("set", value)));
            return doc;
        }).toList();

        solrClient.add(coreName, docs);
        solrClient.commit(coreName);
        logger.info("Denormalization: updated {} documents in core '{}'", ids.size(), coreName);
    }
}
