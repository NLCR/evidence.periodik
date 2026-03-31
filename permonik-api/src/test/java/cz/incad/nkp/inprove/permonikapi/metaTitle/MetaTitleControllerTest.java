package cz.incad.nkp.inprove.permonikapi.metaTitle;

import cz.incad.nkp.inprove.permonikapi.metaTitle.dto.MetaTitleOverviewDTO;
import cz.incad.nkp.inprove.permonikapi.specimen.dto.StatsForMetaTitleOverviewDTO;
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

@WebMvcTest(controllers = MetaTitleController.class)
@Import(MetaTitleControllerTest.TestSecurityConfiguration.class)
@ImportAutoConfiguration({
    SecurityAutoConfiguration.class,
    SecurityFilterAutoConfiguration.class,
    ServletWebSecurityAutoConfiguration.class,
    UserDetailsServiceAutoConfiguration.class
})
class MetaTitleControllerTest {

    @TestConfiguration
    static class TestSecurityConfiguration {
        @Bean
        SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http
                .authorizeHttpRequests((authz) -> authz
                    .requestMatchers(HttpMethod.GET, "/api/metatitle/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/metatitle/**").authenticated()
                    .requestMatchers(HttpMethod.PUT, "/api/metatitle/**").authenticated()
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
    MetaTitleService metaTitleService;

    @Test
    // Verifies public overview endpoint is accessible without authentication.
    void listOverview_isPublic() throws Exception {
        MetaTitleOverviewDTO dto = new MetaTitleOverviewDTO(
            UUID.randomUUID().toString(),
            "Public Meta",
            new StatsForMetaTitleOverviewDTO(null, null, 1L, 1L, 1)
        );
        when(metaTitleService.getMetaTitleOverview()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/metatitle/list/overview"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].name", is("Public Meta")));
    }

    @Test
    // Verifies create endpoint is protected and rejects anonymous request.
    void createMetaTitle_requiresAuthentication() throws Exception {
        mockMvc.perform(post("/api/metatitle")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"name":"Meta","note":"Note","isPublic":true}
                    """))
            .andExpect(status().isForbidden());
    }

    @Test
    // Verifies authenticated create request is delegated to service layer.
    void createMetaTitle_createsAndReturns200() throws Exception {
        mockMvc.perform(post("/api/metatitle")
                .with(SecurityMockMvcRequestPostProcessors.authentication(TestSecuritySupport.authentication()))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"name":"Meta","note":"Note","isPublic":true}
                    """))
            .andExpect(status().isOk());

        verify(metaTitleService).createMetaTitle(any(cz.incad.nkp.inprove.permonikapi.metaTitle.dto.CreatableMetaTitleDTO.class));
    }

    @Test
    // Verifies update endpoint is protected and rejects anonymous request.
    void updateMetaTitle_requiresAuthentication() throws Exception {
        mockMvc.perform(put("/api/metatitle/some-id")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"id":"some-id","name":"Updated","note":"Note","isPublic":true}
                    """))
            .andExpect(status().isForbidden());
    }

    @Test
    // Verifies authenticated update request is delegated to service layer.
    void updateMetaTitle_updatesAndReturns200() throws Exception {
        mockMvc.perform(put("/api/metatitle/some-id")
                .with(SecurityMockMvcRequestPostProcessors.authentication(TestSecuritySupport.authentication()))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"id":"some-id","name":"Updated","note":"Note","isPublic":true}
                    """))
            .andExpect(status().isOk());

        verify(metaTitleService).updateMetaTitle(eq("some-id"), any(MetaTitle.class));
    }
}
