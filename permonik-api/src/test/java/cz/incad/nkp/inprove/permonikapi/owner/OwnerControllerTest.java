package cz.incad.nkp.inprove.permonikapi.owner;

import cz.incad.nkp.inprove.permonikapi.support.TestSecuritySupport;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.security.autoconfigure.web.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.security.autoconfigure.web.servlet.ServletWebSecurityAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
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

@WebMvcTest(controllers = OwnerController.class)
@Import(OwnerControllerTest.TestSecurityConfiguration.class)
@ImportAutoConfiguration({
    SecurityAutoConfiguration.class,
    SecurityFilterAutoConfiguration.class,
    ServletWebSecurityAutoConfiguration.class,
    UserDetailsServiceAutoConfiguration.class
})
class OwnerControllerTest {

    @TestConfiguration
    static class TestSecurityConfiguration {
        @Bean
        SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http
                .authorizeHttpRequests((authz) -> authz
                    .requestMatchers(HttpMethod.GET, "/api/owner/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/owner/**").authenticated()
                    .requestMatchers(HttpMethod.PUT, "/api/owner/**").authenticated()
                    .anyRequest().denyAll()
                )
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable);
            return http.build();
        }
    }

    @org.springframework.beans.factory.annotation.Autowired
    MockMvc mockMvc;

    @MockitoBean
    OwnerService ownerService;

    @Test
    // Verifies public listing endpoint is accessible without authentication.
    void listOwners_isPublic() throws Exception {
        Owner owner = new Owner();
        owner.setId(UUID.randomUUID().toString());
        owner.setName("Public Library");
        owner.setShorthand("PUB");
        owner.setSigla("PUB001");
        when(ownerService.getOwners()).thenReturn(List.of(owner));

        mockMvc.perform(get("/api/owner/list/all"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].name", is("Public Library")));
    }

    @Test
    // Verifies controller returns empty array when service returns no owners.
    void listOwners_returnsEmptyList() throws Exception {
        when(ownerService.getOwners()).thenReturn(List.of());

        mockMvc.perform(get("/api/owner/list/all"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    // Verifies create endpoint is protected and rejects anonymous request.
    void createOwner_requiresAuthentication() throws Exception {
        mockMvc.perform(post("/api/owner")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"name": "Library", "shorthand": "LIB", "sigla": "LIB001"}
                    """))
            .andExpect(status().isForbidden());
    }

    @Test
    // Verifies authenticated create request is delegated to service layer.
    void createOwner_createsAndReturns200() throws Exception {
        mockMvc.perform(post("/api/owner")
                .with(SecurityMockMvcRequestPostProcessors.authentication(TestSecuritySupport.authentication()))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"name": "New Library", "shorthand": "NEW", "sigla": "NEW001"}
                    """))
            .andExpect(status().isOk());

        verify(ownerService).createOwner(eq(new cz.incad.nkp.inprove.permonikapi.owner.dto.CreatableOwnerDTO(
            "New Library", "NEW", "NEW001"
        )));
    }

    @Test
    // Verifies update endpoint is protected and rejects anonymous request.
    void updateOwner_requiresAuthentication() throws Exception {
        mockMvc.perform(put("/api/owner/some-id")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"id": "some-id", "name": "Updated", "shorthand": "UPD", "sigla": "UPD001"}
                    """))
            .andExpect(status().isForbidden());
    }

    @Test
    // Verifies authenticated update request is delegated to service layer.
    void updateOwner_updatesExistingOwner() throws Exception {
        mockMvc.perform(put("/api/owner/some-id")
                .with(SecurityMockMvcRequestPostProcessors.authentication(TestSecuritySupport.authentication()))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"id": "some-id", "name": "Updated", "shorthand": "UPD", "sigla": "UPD001"}
                    """))
            .andExpect(status().isOk());

        verify(ownerService).updateOwner(eq("some-id"), any(Owner.class));
    }
}
