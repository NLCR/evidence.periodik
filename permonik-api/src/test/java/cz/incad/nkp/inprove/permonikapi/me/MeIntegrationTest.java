package cz.incad.nkp.inprove.permonikapi.me;

import cz.incad.nkp.inprove.permonikapi.AbstractSolrIntegrationTest;
import cz.incad.nkp.inprove.permonikapi.support.TestSecuritySupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class MeIntegrationTest extends AbstractSolrIntegrationTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    // Verifies /api/me returns principal payload for authenticated user.
    void getMe_returnsCurrentUserWhenAuthenticated() throws Exception {
        mockMvc.perform(get("/api/me")
                .with(SecurityMockMvcRequestPostProcessors.authentication(
                    TestSecuritySupport.authenticationWithAuthorities("ROLE_USER")
                )))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id", is(TestSecuritySupport.TEST_USER_ID)))
            .andExpect(jsonPath("$.username", is(TestSecuritySupport.TEST_USERNAME)))
            .andExpect(jsonPath("$.authorities", hasSize(1)));
    }

    @Test
    // Verifies anonymous /api/me call returns empty body with 200.
    void getMe_returnsNullWhenAnonymous() throws Exception {
        mockMvc.perform(get("/api/me"))
            .andExpect(status().isOk())
            .andExpect(content().string(""));
    }
}
