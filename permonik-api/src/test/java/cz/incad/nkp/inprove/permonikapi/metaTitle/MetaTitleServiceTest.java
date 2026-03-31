package cz.incad.nkp.inprove.permonikapi.metaTitle;

import cz.incad.nkp.inprove.permonikapi.AbstractSolrIntegrationTest;
import cz.incad.nkp.inprove.permonikapi.metaTitle.dto.CreatableMetaTitleDTO;
import cz.incad.nkp.inprove.permonikapi.metaTitle.dto.MetaTitleOverviewDTO;
import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDefinition;
import cz.incad.nkp.inprove.permonikapi.support.SolrFixtureFactory;
import cz.incad.nkp.inprove.permonikapi.support.SolrTestSupport;
import cz.incad.nkp.inprove.permonikapi.support.TestSecuritySupport;
import cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.request.SolrQuery;
import org.apache.solr.common.SolrInputDocument;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MetaTitleServiceTest extends AbstractSolrIntegrationTest {

    @Autowired
    MetaTitleService metaTitleService;

    @Autowired
    SolrClient solrClient;

    @BeforeEach
    void setUp() throws Exception {
        SolrTestSupport.clearCores(
            solrClient,
            MetaTitleDefinition.META_TITLE_CORE_NAME,
            VolumeDefinition.VOLUME_CORE_NAME,
            SpecimenDefinition.SPECIMEN_CORE_NAME
        );
        TestSecuritySupport.setAuthenticationContext();
    }

    @AfterEach
    void tearDown() {
        TestSecuritySupport.clearAuthenticationContext();
    }

    @Test
        // Verifies create operation persists metatitle fields in Solr.
    void createMetaTitle_persistsToSolr() throws Exception {
        metaTitleService.createMetaTitle(new CreatableMetaTitleDTO("Meta", "Note", true));

        List<MetaTitle> metaTitles = metaTitleService.getMetaTitles();
        assertThat(metaTitles).hasSize(1);
        assertThat(metaTitles.getFirst().getName()).isEqualTo("Meta");
        assertThat(metaTitles.getFirst().getNote()).isEqualTo("Note");
        assertThat(metaTitles.getFirst().getIsPublic()).isTrue();
    }

    @Test
        // Verifies uniqueness check rejects duplicated metatitle name.
    void createMetaTitle_rejectsDuplicateName() throws Exception {
        metaTitleService.createMetaTitle(new CreatableMetaTitleDTO("Meta", "A", true));

        assertThatThrownBy(() -> metaTitleService.createMetaTitle(new CreatableMetaTitleDTO("Meta", "B", false)))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("already exists");
    }

    @Test
        // Verifies anonymous access to non-public metatitle is hidden as 404.
    void getMetaTitleById_respectsPublicFilterForAnonymous() throws Exception {
        metaTitleService.createMetaTitle(new CreatableMetaTitleDTO("Private", "N", false));
        String id = metaTitleService.getMetaTitles().getFirst().getId();
        TestSecuritySupport.clearAuthenticationContext();

        assertThatThrownBy(() -> metaTitleService.getMetaTitleById(id))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("404");
    }

    @Test
        // Verifies overview projection contains aggregated specimen stats.
    void getMetaTitleOverview_returnsOverviewDto() throws Exception {
        metaTitleService.createMetaTitle(new CreatableMetaTitleDTO("Overview", "", true));
        MetaTitle metaTitle = metaTitleService.getMetaTitles().getFirst();

        String specimenId = UUID.randomUUID().toString();
        SolrInputDocument specimenDoc = SolrFixtureFactory.specimenForMetaTitle(specimenId, metaTitle.getId(), metaTitle.getName());
        solrClient.add(SpecimenDefinition.SPECIMEN_CORE_NAME, specimenDoc);
        solrClient.commit(SpecimenDefinition.SPECIMEN_CORE_NAME);

        List<MetaTitleOverviewDTO> overview = metaTitleService.getMetaTitleOverview();
        assertThat(overview).hasSize(1);
        assertThat(overview.getFirst().name()).isEqualTo("Overview");
        assertThat(overview.getFirst().specimens().mutationsCount()).isEqualTo(1L);
        assertThat(overview.getFirst().specimens().ownersCount()).isEqualTo(1L);
    }

    @Test
        // Verifies metatitle rename is denormalized to volume/specimen cores.
    void updateMetaTitle_propagatesToVolumesAndSpecimens() throws Exception {
        metaTitleService.createMetaTitle(new CreatableMetaTitleDTO("Original", "", true));
        MetaTitle existing = metaTitleService.getMetaTitles().getFirst();

        String volumeId = UUID.randomUUID().toString();
        solrClient.add(VolumeDefinition.VOLUME_CORE_NAME, SolrFixtureFactory.volumeForMetaTitle(volumeId, existing.getId(), existing.getName()));
        solrClient.commit(VolumeDefinition.VOLUME_CORE_NAME);

        String specimenId = UUID.randomUUID().toString();
        solrClient.add(SpecimenDefinition.SPECIMEN_CORE_NAME, SolrFixtureFactory.specimenForMetaTitle(specimenId, existing.getId(), existing.getName()));
        solrClient.commit(SpecimenDefinition.SPECIMEN_CORE_NAME);

        existing.setName("Updated");
        existing.setIsPublic(false);
        metaTitleService.updateMetaTitle(existing.getId(), existing);

        var volumeResponse = solrClient.query(
            VolumeDefinition.VOLUME_CORE_NAME,
            new SolrQuery(VolumeDefinition.ID_FIELD + ":\"" + volumeId + "\"")
        );
        assertThat(volumeResponse.getResults()).hasSize(1);
        assertThat(volumeResponse.getResults().getFirst().getFieldValue(VolumeDefinition.META_TITLE_NAME_FIELD)).isEqualTo("Updated");

        var specimenResponse = solrClient.query(
            SpecimenDefinition.SPECIMEN_CORE_NAME,
            new SolrQuery(SpecimenDefinition.ID_FIELD + ":\"" + specimenId + "\"")
        );
        assertThat(specimenResponse.getResults()).hasSize(1);
        assertThat(specimenResponse.getResults().getFirst().getFieldValue(SpecimenDefinition.META_TITLE_NAME_FIELD)).isEqualTo("Updated");
    }

}
