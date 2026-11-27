package cz.incad.nkp.inprove.permonikapi.edition;

import cz.incad.nkp.inprove.permonikapi.edition.dto.EditionNameDTO;
import cz.incad.nkp.inprove.permonikapi.edition.model.EditionDTO;
import cz.incad.nkp.inprove.permonikapi.support.TestSecuritySupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.security.autoconfigure.web.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.security.autoconfigure.web.servlet.ServletWebSecurityAutoConfiguration;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = EditionController.class)
@Import(EditionControllerTest.TestSecurityConfiguration.class)
@ImportAutoConfiguration({
    SecurityAutoConfiguration.class,
    SecurityFilterAutoConfiguration.class,
    ServletWebSecurityAutoConfiguration.class,
    UserDetailsServiceAutoConfiguration.class
})
class EditionControllerTest {

    @TestConfiguration
    static class TestSecurityConfiguration {
        @Bean
        SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http
                .authorizeHttpRequests((authz) -> authz
                    .requestMatchers(HttpMethod.GET, "/api/edition/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/edition/**").authenticated()
                    .requestMatchers(HttpMethod.PUT, "/api/edition/**").authenticated()
                    .anyRequest().denyAll()
                )
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable);
            return http.build();
        }
    }

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    EditionService editionService;

    @Test
    // Verifies public listing endpoint is accessible without authentication.
    void listEditions_isPublic() throws Exception {
        EditionDTO dto = new EditionDTO();
        dto.setId(UUID.randomUUID().toString());
        dto.setName(new EditionNameDTO("Hrad", "Hrad", "Castle"));
        dto.setIsDefault(true);
        dto.setIsAttachment(false);
        dto.setIsPeriodicAttachment(false);
        when(editionService.getEditions("cs")).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/edition/list/all")
                .header("Accept-Language", "cs"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].name.cs", is("Hrad")));
    }

    @Test
    // Verifies Accept-Language header is passed to service for locale-aware sorting.
    void listEditions_respectsAcceptLanguageHeader() throws Exception {
        EditionDTO dto = new EditionDTO();
        dto.setId(UUID.randomUUID().toString());
        dto.setName(new EditionNameDTO("Hrad", "Hrad", "Castle"));
        when(editionService.getEditions("sk")).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/edition/list/all")
                .header("Accept-Language", "sk"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    // Verifies create endpoint is protected and rejects anonymous request.
    void createEdition_requiresAuthentication() throws Exception {
        mockMvc.perform(post("/api/edition")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": {"cs": "Ráno", "sk": "Ráno", "en": "Morning"},
                      "isDefault": false,
                      "isAttachment": false,
                      "isPeriodicAttachment": false
                    }
                    """))
            .andExpect(status().isForbidden());
    }

    @Test
    // Verifies authenticated create request is delegated to service layer.
    void createEdition_createsAndReturns200() throws Exception {
        mockMvc.perform(post("/api/edition")
                .with(SecurityMockMvcRequestPostProcessors.authentication(TestSecuritySupport.authentication()))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": {"cs": "Ráno", "sk": "Ráno", "en": "Morning"},
                      "isDefault": false,
                      "isAttachment": false,
                      "isPeriodicAttachment": false
                    }
                    """))
            .andExpect(status().isOk());

        verify(editionService).createEdition(any(EditionDTO.class));
    }

    @Test
    // Verifies update endpoint is protected and rejects anonymous request.
    void updateEdition_requiresAuthentication() throws Exception {
        mockMvc.perform(put("/api/edition/some-id")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "id": "some-id",
                      "name": {"cs": "Večer", "sk": "Večer", "en": "Evening"},
                      "isDefault": false,
                      "isAttachment": false,
                      "isPeriodicAttachment": false
                    }
                    """))
            .andExpect(status().isForbidden());
    }

    @Test
    // Verifies authenticated update request is delegated to service layer.
    void updateEdition_updatesAndReturns200() throws Exception {
        mockMvc.perform(put("/api/edition/some-id")
                .with(SecurityMockMvcRequestPostProcessors.authentication(TestSecuritySupport.authentication()))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "id": "some-id",
                      "name": {"cs": "Večer", "sk": "Večer", "en": "Evening"},
                      "isDefault": true,
                      "isAttachment": false,
                      "isPeriodicAttachment": false
                    }
                    """))
            .andExpect(status().isOk());

        verify(editionService).updateEdition(eq("some-id"), any(EditionDTO.class));
    }
}
