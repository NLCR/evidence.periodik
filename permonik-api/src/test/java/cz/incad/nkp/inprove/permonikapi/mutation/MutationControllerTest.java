package cz.incad.nkp.inprove.permonikapi.mutation;

import cz.incad.nkp.inprove.permonikapi.mutation.dto.MutationNameDTO;
import cz.incad.nkp.inprove.permonikapi.mutation.model.MutationDTO;
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

@WebMvcTest(controllers = MutationController.class)
@Import(MutationControllerTest.TestSecurityConfiguration.class)
@ImportAutoConfiguration({
    SecurityAutoConfiguration.class,
    SecurityFilterAutoConfiguration.class,
    ServletWebSecurityAutoConfiguration.class,
    UserDetailsServiceAutoConfiguration.class
})
class MutationControllerTest {

    @TestConfiguration
    static class TestSecurityConfiguration {
        @Bean
        SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http
                .authorizeHttpRequests((authz) -> authz
                    .requestMatchers(HttpMethod.GET, "/api/mutation/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/mutation/**").authenticated()
                    .requestMatchers(HttpMethod.PUT, "/api/mutation/**").authenticated()
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
    MutationService mutationService;

    @Test
    // Verifies public listing endpoint is accessible without authentication.
    void listMutations_isPublic() throws Exception {
        MutationDTO dto = new MutationDTO();
        dto.setId(UUID.randomUUID().toString());
        dto.setName(new MutationNameDTO("Hrad", "Hrad", "Castle"));
        when(mutationService.getMutations("cs")).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/mutation/list/all")
                .header("Accept-Language", "cs"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].name.cs", is("Hrad")));
    }

    @Test
    // Verifies Accept-Language header is passed to service for locale-aware sorting.
    void listMutations_respectsAcceptLanguageHeader() throws Exception {
        MutationDTO dto = new MutationDTO();
        dto.setId(UUID.randomUUID().toString());
        dto.setName(new MutationNameDTO("Hrad", "Hrad", "Castle"));
        when(mutationService.getMutations("en")).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/mutation/list/all")
                .header("Accept-Language", "en"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    // Verifies create endpoint is protected and rejects anonymous request.
    void createMutation_requiresAuthentication() throws Exception {
        mockMvc.perform(post("/api/mutation")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"name": {"cs": "Rano", "sk": "Rano", "en": "Morning"}}
                    """))
            .andExpect(status().isForbidden());
    }

    @Test
    // Verifies authenticated create request is delegated to service layer.
    void createMutation_createsAndReturns200() throws Exception {
        mockMvc.perform(post("/api/mutation")
                .with(SecurityMockMvcRequestPostProcessors.authentication(TestSecuritySupport.authentication()))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"name": {"cs": "Rano", "sk": "Rano", "en": "Morning"}}
                    """))
            .andExpect(status().isOk());

        verify(mutationService).createMutation(any(MutationDTO.class));
    }

    @Test
    // Verifies update endpoint is protected and rejects anonymous request.
    void updateMutation_requiresAuthentication() throws Exception {
        mockMvc.perform(put("/api/mutation/some-id")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"id": "some-id", "name": {"cs": "Vecer", "sk": "Vecer", "en": "Evening"}}
                    """))
            .andExpect(status().isForbidden());
    }

    @Test
    // Verifies authenticated update request is delegated to service layer.
    void updateMutation_updatesAndReturns200() throws Exception {
        mockMvc.perform(put("/api/mutation/some-id")
                .with(SecurityMockMvcRequestPostProcessors.authentication(TestSecuritySupport.authentication()))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"id": "some-id", "name": {"cs": "Vecer", "sk": "Vecer", "en": "Evening"}}
                    """))
            .andExpect(status().isOk());

        verify(mutationService).updateMutation(eq("some-id"), any(MutationDTO.class));
    }
}
