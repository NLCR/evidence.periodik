package cz.incad.nkp.inprove.permonikapi.auth;

import cz.incad.nkp.inprove.permonikapi.AbstractSolrDevIntegrationTest;
import cz.incad.nkp.inprove.permonikapi.support.SolrTestSupport;
import cz.incad.nkp.inprove.permonikapi.user.User;
import cz.incad.nkp.inprove.permonikapi.user.UserDefinition;
import org.apache.solr.client.solrj.SolrClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthIntegrationTest extends AbstractSolrDevIntegrationTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    SolrClient solrClient;

    @Autowired
    PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() throws Exception {
        SolrTestSupport.clearCores(solrClient, UserDefinition.USER_CORE_NAME);
    }

    @Test
        // Verifies successful form login creates HTTP session cookie.
    void loginBasic_withValidCredentials_returnsSession() throws Exception {
        createUser("login-user", "secret");

        mockMvc.perform(post("/api/auth/login/basic")
                .contentType("application/json")
                .content("""
                    {"username":"login-user","password":"secret"}
                    """))
            .andExpect(status().isOk())
            .andExpect(header().string("Set-Cookie", org.hamcrest.Matchers.containsString("SESSION=")));
    }

    @Test
        // Verifies invalid credentials are mapped to 401 Unauthorized.
    void loginBasic_withInvalidCredentials_returns401() throws Exception {
        createUser("login-user", "secret");

        mockMvc.perform(post("/api/auth/login/basic")
                .contentType("application/json")
                .content("""
                    {"username":"login-user","password":"wrong"}
                    """))
            .andExpect(status().isUnauthorized());
    }

    @Test
        // Verifies logout invalidates session and triggers configured redirect.
    void logout_clearsSessionAndRedirects() throws Exception {
        createUser("login-user", "secret");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login/basic")
                .contentType("application/json")
                .content("""
                    {"username":"login-user","password":"secret"}
                    """))
            .andExpect(status().isOk())
            .andReturn();

        mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/logout")
                .cookie(Objects.requireNonNull(loginResult.getResponse().getCookie("SESSION"))))
            .andExpect(status().is3xxRedirection())
            .andExpect(header().string("Location", "https://localhost/"));
    }

    private void createUser(String username, String rawPassword) throws Exception {
        User user = User.builder()
            .id(UUID.randomUUID().toString())
            .email(username + "@example.com")
            .userName(username)
            .firstName("First")
            .lastName("Last")
            .role("user")
            .active(true)
            .owners(List.of())
            .password(passwordEncoder.encode(rawPassword))
            .build();
        solrClient.addBean(UserDefinition.USER_CORE_NAME, user);
        solrClient.commit(UserDefinition.USER_CORE_NAME);
    }
}
