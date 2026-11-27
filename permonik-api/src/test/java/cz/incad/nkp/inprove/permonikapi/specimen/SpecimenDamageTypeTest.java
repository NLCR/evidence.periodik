package cz.incad.nkp.inprove.permonikapi.specimen;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import cz.incad.nkp.inprove.permonikapi.common.ReferenceDataService;
import cz.incad.nkp.inprove.permonikapi.config.security.OwnerAuthorizationService;
import cz.incad.nkp.inprove.permonikapi.metaTitle.MetaTitleService;
import cz.incad.nkp.inprove.permonikapi.specimen.model.Specimen;
import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDTO;
import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenMapper;
import cz.incad.nkp.inprove.permonikapi.volume.VolumeController;
import cz.incad.nkp.inprove.permonikapi.volume.VolumeService;
import cz.incad.nkp.inprove.permonikapi.volume.model.Volume;
import cz.incad.nkp.inprove.permonikapi.volume.model.VolumeMapper;
import cz.incad.nkp.inprove.permonikdomain.SpecimenDamageType;
import java.util.List;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.beans.DocumentObjectBinder;
import org.apache.solr.client.solrj.request.SolrQuery;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocument;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tools.jackson.databind.ObjectMapper;

class SpecimenDamageTypeTest {
    /** Pins the storage vocabulary and verifies the Kotlin lookup is directly usable from Java. */
    @Test
    void stableCodesAreAcceptedWithoutAcceptingEnumNamesOrNormalizedInput() {
        var codes =
                List.of(
                        "OK", "ChCC", "ChS", "PP", "Deg", "ChPag", "ChCis", "ChSv", "Cz", "NS",
                        "CzV", "ChDatum");
        assertThat(SpecimenDamageType.values())
                .extracting(SpecimenDamageType::getCode)
                .containsExactlyElementsOf(codes);
        for (String code : codes) {
            assertThat(SpecimenDamageType.fromCode(code)).isNotNull();
        }
        assertThat(SpecimenDamageType.fromCode("ChS")).isEqualTo(SpecimenDamageType.MISSING_PAGES);
        assertThat(SpecimenDamageType.fromCode("MISSING_PAGES")).isNull();
        assertThat(SpecimenDamageType.fromCode("chs")).isNull();
        assertThat(SpecimenDamageType.fromCode(" ChS ")).isNull();
        assertThat(SpecimenDamageType.fromCode(null)).isNull();

        var dto = new SpecimenDTO();
        dto.setDamageTypes(codes);
        var service =
                new SpecimenService(
                        mock(SolrClient.class),
                        mock(SpecimenMapper.class),
                        new ObjectMapper(),
                        mock(ReferenceDataService.class),
                        mock(OwnerAuthorizationService.class));
        service.validateDamageTypes(List.of(dto));
        dto.setDamageTypes(null);
        service.validateDamageTypes(List.of(dto));
    }

    /** Exercises real Solr binding in both directions without losing unknown historical strings. */
    @Test
    @ExtendWith(OutputCaptureExtension.class)
    void historicalSolrCodesRemainReadableWithWarnings(CapturedOutput output) {
        var document = new SolrDocument();
        var codes = List.of("OK", "FutureDamage");
        document.setField("id", "historical-specimen");
        document.setField("damage_types", codes);
        var binder = new DocumentObjectBinder();

        var specimen = binder.getBean(Specimen.class, document);

        assertThat(specimen.getDamageTypes()).containsExactlyElementsOf(codes);
        assertThat(binder.toSolrInputDocument(specimen).getFieldValues("damage_types"))
                .containsExactlyElementsOf(codes);
        assertThat(output).contains("WARN", "Unknown specimen damage code: FutureDamage");
    }

    /** Proves all volume write routes return 400 before writes or destructive regeneration. */
    @Test
    void unknownRequestCodesAreRejectedBeforeAnyWrites() throws Exception {
        var solr = mock(SolrClient.class);
        var references = mock(ReferenceDataService.class);
        var authorization = mock(OwnerAuthorizationService.class);
        var specimens =
                new SpecimenService(
                        solr,
                        mock(SpecimenMapper.class),
                        new ObjectMapper(),
                        references,
                        authorization);
        var volumes =
                new VolumeService(
                        mock(MetaTitleService.class),
                        specimens,
                        solr,
                        mock(VolumeMapper.class),
                        references,
                        authorization);
        var mvc = MockMvcBuilders.standaloneSetup(new VolumeController(volumes)).build();
        var existing = new Volume();
        existing.setId("volume");
        var response = mock(QueryResponse.class);
        when(solr.query(eq("volume"), any(SolrQuery.class))).thenReturn(response);
        when(response.getBeans(Volume.class)).thenReturn(List.of(existing));
        var body =
                """
            {"volume":{"id":"volume"},"specimens":[
              {"damageTypes":["OK"]},{"damageTypes":["FutureDamage"]}
            ]}
            """;

        mvc.perform(post("/api/volume").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(solr);
        mvc.perform(put("/api/volume/volume").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
        mvc.perform(
                        put("/api/volume/volume/overgenerated")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                .andExpect(status().isBadRequest());
        verify(solr, times(2)).query(eq("volume"), any(SolrQuery.class));
        verifyNoMoreInteractions(solr);
        verifyNoInteractions(references);
    }
}
