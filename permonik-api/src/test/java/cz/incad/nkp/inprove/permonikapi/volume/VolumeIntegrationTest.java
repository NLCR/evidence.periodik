package cz.incad.nkp.inprove.permonikapi.volume;

import cz.incad.nkp.inprove.permonikapi.AbstractSolrIntegrationTest;
import cz.incad.nkp.inprove.permonikapi.edition.model.EditionDefinition;
import cz.incad.nkp.inprove.permonikapi.metaTitle.MetaTitleDefinition;
import cz.incad.nkp.inprove.permonikapi.mutation.model.MutationDefinition;
import cz.incad.nkp.inprove.permonikapi.owner.OwnerDefinition;
import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDTO;
import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDefinition;
import cz.incad.nkp.inprove.permonikapi.support.SolrFixtureFactory;
import cz.incad.nkp.inprove.permonikapi.support.SolrTestSupport;
import cz.incad.nkp.inprove.permonikapi.support.TestSecuritySupport;
import cz.incad.nkp.inprove.permonikapi.support.VolumeSpecimenDtoFactory;
import cz.incad.nkp.inprove.permonikapi.volume.dto.EditableVolumeWithSpecimensDTO;
import cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDTO;
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
    // Verifies anonymous users receive only public specimens on detail endpoint.
    void getVolumeDetail_anonymousReturnsOnlyPublicSpecimens() throws Exception {
        String publicVolumeId = UUID.randomUUID().toString();
        String publicSpecimenId = UUID.randomUUID().toString();
        String nonPublicSpecimenId = UUID.randomUUID().toString();

        SpecimenDTO publicSpecimen = VolumeSpecimenDtoFactory.specimenDto(publicSpecimenId, publicVolumeId, "Public");
        SpecimenDTO nonPublicSpecimen = VolumeSpecimenDtoFactory.specimenDto(nonPublicSpecimenId, publicVolumeId, "NonPublic");
        nonPublicSpecimen.setNumExists(false);
        nonPublicSpecimen.setNumMissing(false);

        volumeService.createVolumeWithSpecimens(
            VolumeSpecimenDtoFactory.editableVolume(
                publicVolumeId,
                "BAR-API-PUBLIC",
                List.of(publicSpecimen, nonPublicSpecimen)
            )
        );

        TestSecuritySupport.clearAuthenticationContext();

        mockMvc.perform(get("/api/volume/{id}/detail", publicVolumeId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.volume.id", is(publicVolumeId)))
            .andExpect(jsonPath("$.specimens", hasSize(1)))
            .andExpect(jsonPath("$.specimens[0].name", is("Public")))
            .andExpect(jsonPath("$.specimens[?(@.name == 'NonPublic')]", hasSize(0)))
            .andExpect(jsonPath("$.specimens[?(@.numExists == false && @.numMissing == false)]", hasSize(0)));
    }

    @Test
    // Verifies authenticated users receive both public and non-public specimens on detail endpoint.
    void getVolumeDetail_authenticatedReturnsPublicAndNonPublicSpecimens() throws Exception {
        String mixedVolumeId = UUID.randomUUID().toString();
        String publicSpecimenId = UUID.randomUUID().toString();
        String nonPublicSpecimenId = UUID.randomUUID().toString();

        SpecimenDTO publicSpecimen = VolumeSpecimenDtoFactory.specimenDto(publicSpecimenId, mixedVolumeId, "Public");
        SpecimenDTO nonPublicSpecimen = VolumeSpecimenDtoFactory.specimenDto(nonPublicSpecimenId, mixedVolumeId, "NonPublic");
        nonPublicSpecimen.setNumExists(false);
        nonPublicSpecimen.setNumMissing(false);

        volumeService.createVolumeWithSpecimens(
            VolumeSpecimenDtoFactory.editableVolume(
                mixedVolumeId,
                "BAR-API-MIXED",
                List.of(publicSpecimen, nonPublicSpecimen)
            )
        );

        mockMvc.perform(get("/api/volume/{id}/detail", mixedVolumeId)
                .with(SecurityMockMvcRequestPostProcessors.authentication(TestSecuritySupport.authentication())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.volume.id", is(mixedVolumeId)))
            .andExpect(jsonPath("$.specimens", hasSize(2)))
            .andExpect(jsonPath("$.specimens[?(@.name == 'NonPublic')]", hasSize(1)))
            .andExpect(jsonPath("$.specimens[?(@.numExists == false && @.numMissing == false)]", hasSize(1)));
    }

    @Test
    // Verifies anonymous access is blocked for volume linked to non-public metatitle.
    void getVolumeDetail_anonymousWithNonPublicMetaTitle_returnsNotFound() throws Exception {
        String privateMetaTitleId = UUID.randomUUID().toString();
        solrClient.add(
            MetaTitleDefinition.META_TITLE_CORE_NAME,
            SolrFixtureFactory.metaTitleDoc(privateMetaTitleId, "Private Meta", false)
        );
        solrClient.commit(MetaTitleDefinition.META_TITLE_CORE_NAME);

        String privateVolumeId = UUID.randomUUID().toString();
        String specimenId = UUID.randomUUID().toString();
        VolumeDTO privateVolume = VolumeSpecimenDtoFactory.volumeDto(privateVolumeId, "BAR-API-PRIVATE");
        privateVolume.setMetaTitleId(privateMetaTitleId);
        volumeService.createVolumeWithSpecimens(
            new EditableVolumeWithSpecimensDTO(
                privateVolume,
                List.of(VolumeSpecimenDtoFactory.specimenDto(specimenId, privateVolumeId, "PrivateVolumeSpecimen"))
            )
        );

        TestSecuritySupport.clearAuthenticationContext();

        mockMvc.perform(get("/api/volume/{id}/detail", privateVolumeId))
            .andExpect(status().isNotFound());
    }

    @Test
    // Verifies authenticated users can access detail for volume linked to non-public metatitle.
    void getVolumeDetail_authenticatedWithNonPublicMetaTitle_returnsOk() throws Exception {
        String privateMetaTitleId = UUID.randomUUID().toString();
        solrClient.add(
            MetaTitleDefinition.META_TITLE_CORE_NAME,
            SolrFixtureFactory.metaTitleDoc(privateMetaTitleId, "Private Meta Auth", false)
        );
        solrClient.commit(MetaTitleDefinition.META_TITLE_CORE_NAME);

        String privateVolumeId = UUID.randomUUID().toString();
        String specimenId = UUID.randomUUID().toString();
        VolumeDTO privateVolume = VolumeSpecimenDtoFactory.volumeDto(privateVolumeId, "BAR-API-PRIVATE-AUTH");
        privateVolume.setMetaTitleId(privateMetaTitleId);
        volumeService.createVolumeWithSpecimens(
            new EditableVolumeWithSpecimensDTO(
                privateVolume,
                List.of(VolumeSpecimenDtoFactory.specimenDto(specimenId, privateVolumeId, "PrivateVolumeSpecimen"))
            )
        );

        mockMvc.perform(get("/api/volume/{id}/detail", privateVolumeId)
                .with(SecurityMockMvcRequestPostProcessors.authentication(TestSecuritySupport.authentication())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.volume.id", is(privateVolumeId)))
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

    @Test
    // Verifies anonymous access to stats is blocked for volume linked to non-public metatitle.
    void getVolumeStats_anonymousWithNonPublicMetaTitle_returnsNotFound() throws Exception {
        String privateMetaTitleId = UUID.randomUUID().toString();
        solrClient.add(
            MetaTitleDefinition.META_TITLE_CORE_NAME,
            SolrFixtureFactory.metaTitleDoc(privateMetaTitleId, "Private Meta Stats", false)
        );
        solrClient.commit(MetaTitleDefinition.META_TITLE_CORE_NAME);

        String privateVolumeId = UUID.randomUUID().toString();
        String specimenId = UUID.randomUUID().toString();
        VolumeDTO privateVolume = VolumeSpecimenDtoFactory.volumeDto(privateVolumeId, "BAR-API-PRIVATE-STATS");
        privateVolume.setMetaTitleId(privateMetaTitleId);
        volumeService.createVolumeWithSpecimens(
            new EditableVolumeWithSpecimensDTO(
                privateVolume,
                List.of(VolumeSpecimenDtoFactory.specimenDto(specimenId, privateVolumeId, "PrivateStatsSpecimen"))
            )
        );

        TestSecuritySupport.clearAuthenticationContext();

        mockMvc.perform(get("/api/volume/{id}/stats", privateVolumeId))
            .andExpect(status().isNotFound());
    }

}
