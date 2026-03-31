package cz.incad.nkp.inprove.permonikapi.volume;

import cz.incad.nkp.inprove.permonikapi.AbstractSolrIntegrationTest;
import cz.incad.nkp.inprove.permonikapi.edition.model.EditionDefinition;
import cz.incad.nkp.inprove.permonikapi.metaTitle.MetaTitleDefinition;
import cz.incad.nkp.inprove.permonikapi.mutation.model.MutationDefinition;
import cz.incad.nkp.inprove.permonikapi.owner.OwnerDefinition;
import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDefinition;
import cz.incad.nkp.inprove.permonikapi.support.SolrFixtureFactory;
import cz.incad.nkp.inprove.permonikapi.support.SolrTestSupport;
import cz.incad.nkp.inprove.permonikapi.support.TestSecuritySupport;
import cz.incad.nkp.inprove.permonikapi.support.VolumeSpecimenDtoFactory;
import cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition;
import org.apache.solr.client.solrj.SolrClient;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class VolumeIntegrationTest extends AbstractSolrIntegrationTest {
    @Autowired
    MockMvc mockMvc;

    @Autowired
    VolumeService volumeService;

    @Autowired
    SolrClient solrClient;

    private String volumeId;

    @BeforeEach
    void setUp() throws Exception {
        // Full-stack tests use shared Solr state, so reset touched cores per method.
        SolrTestSupport.clearCores(
            solrClient,
            VolumeDefinition.VOLUME_CORE_NAME,
            SpecimenDefinition.SPECIMEN_CORE_NAME,
            MetaTitleDefinition.META_TITLE_CORE_NAME,
            MutationDefinition.MUTATION_CORE_NAME,
            OwnerDefinition.OWNER_CORE_NAME,
            EditionDefinition.EDITION_CORE_NAME
        );

        TestSecuritySupport.setAuthenticationContext();
        SolrFixtureFactory.seedDefaultReferenceData(solrClient);

        volumeId = UUID.randomUUID().toString();
        String specimenId = UUID.randomUUID().toString();
        volumeService.createVolumeWithSpecimens(
            VolumeSpecimenDtoFactory.editableVolume(
                volumeId,
                "BAR-API",
                List.of(VolumeSpecimenDtoFactory.specimenDto(specimenId, volumeId, "Morning"))
            )
        );
    }

    @AfterEach
    void tearDown() {
        TestSecuritySupport.clearAuthenticationContext();
    }

    @Test
    // Verifies detail endpoint returns stored volume plus linked specimens.
    void getVolumeDetail_returnsFullDetail() throws Exception {
        mockMvc.perform(get("/api/volume/{id}/detail", volumeId)
                .with(SecurityMockMvcRequestPostProcessors.authentication(TestSecuritySupport.authentication())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.volume.id", is(volumeId)))
            .andExpect(jsonPath("$.specimens", hasSize(1)));
    }

    @Test
    // Verifies stats endpoint exposes aggregated overview for volume context.
    void getVolumeStats_returnsOverviewStats() throws Exception {
        mockMvc.perform(get("/api/volume/{id}/stats", volumeId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.metaTitleName", is("Meta Title")))
            .andExpect(jsonPath("$.specimens", hasSize(1)));
    }

}
