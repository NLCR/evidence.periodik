package cz.incad.nkp.inprove.permonikapi.user;

import cz.incad.nkp.inprove.permonikapi.config.security.user.UserDetailsServiceImpl;
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
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.session.data.redis.RedisIndexedSessionRepository;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = UserController.class)
@Import(UserControllerTest.TestSecurityConfiguration.class)
@ImportAutoConfiguration({
    SecurityAutoConfiguration.class,
    SecurityFilterAutoConfiguration.class,
    ServletWebSecurityAutoConfiguration.class,
    UserDetailsServiceAutoConfiguration.class
})
class UserControllerTest {

    @Autowired
    MockMvc mockMvc;
    @MockitoBean
    UserService userService;
    @MockitoBean
    UserDetailsServiceImpl userDetailsService;
    @MockitoBean
    RedisIndexedSessionRepository sessionRepository;

    @Test
        // Verifies user listing endpoint is protected and rejects anonymous request.
    void listUsers_requiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/user/list/all"))
            .andExpect(status().isForbidden());
    }

    @Test
        // Verifies authenticated listing request returns serialized users.
    void listUsers_returnsUsersForAuthenticated() throws Exception {
        User user = User.builder()
            .id(UUID.randomUUID().toString())
            .email("admin@example.com")
            .userName("admin")
            .firstName("Admin")
            .lastName("User")
            .role("admin")
            .active(true)
            .build();
        when(userService.getUsers()).thenReturn(List.of(user));

        mockMvc.perform(get("/api/user/list/all")
                .with(SecurityMockMvcRequestPostProcessors.authentication(TestSecuritySupport.authentication())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].userName", is("admin")));
    }

    @Test
        // Verifies user update endpoint is protected and rejects anonymous request.
    void updateUser_requiresAuthentication() throws Exception {
        mockMvc.perform(put("/api/user/some-id")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"id":"some-id","email":"a@a","userName":"u","firstName":"f","lastName":"l","role":"user","active":true}
                    """))
            .andExpect(status().isForbidden());
    }

    @Test
        // Verifies authenticated update request is delegated to service layer.
    void updateUser_updatesForAuthenticated() throws Exception {
        when(sessionRepository.findByPrincipalName("updatedUser"))
            .thenReturn(Map.of());

        mockMvc.perform(put("/api/user/some-id")
                .with(SecurityMockMvcRequestPostProcessors.authentication(TestSecuritySupport.authentication()))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "id":"some-id",
                      "email":"u@example.com",
                      "userName":"updatedUser",
                      "firstName":"First",
                      "lastName":"Last",
                      "role":"user",
                      "active":true
                    }
                    """))
            .andExpect(status().isOk());

        verify(userService).updateUser(eq("some-id"), any(User.class));
    }

    @TestConfiguration
    static class TestSecurityConfiguration {
        @Bean
        SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http
                .authorizeHttpRequests((authz) -> authz
                    .requestMatchers("/api/user/**").authenticated()
                    .anyRequest().denyAll()
                )
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable);
            return http.build();
        }
    }
}
