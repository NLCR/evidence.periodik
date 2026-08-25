package cz.incad.nkp.inprove.permonikidentitygateway;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import cz.incad.nkp.inprove.permonikidentitygateway.identity.UserEntity;
import cz.incad.nkp.inprove.permonikidentitygateway.identity.IdentityPrincipal;
import cz.incad.nkp.inprove.permonikidentitygateway.identity.IdentityService;
import cz.incad.nkp.inprove.permonikidentitygateway.identity.UserRepository;
import cz.incad.nkp.inprove.permonikidentitygateway.identity.UserRole;
import cz.incad.nkp.inprove.permonikidentitygateway.security.JwtService;
import com.nimbusds.jwt.SignedJWT;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:identity;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.autoconfigure.exclude=org.springframework.boot.session.data.redis.autoconfigure.SessionDataRedisAutoConfiguration",
        "identity.jwt.secret=test-secret-with-at-least-thirty-two-bytes",
        "identity.dev-user.password=admin"
})
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class IdentityEndpointsIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired IdentityService identities;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired JwtService jwtService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void basicLoginCreatesSessionAndMeResponse() throws Exception {
        MockHttpSession session = login("admin", "admin");

        mvc.perform(get("/api/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.role").value("admin"))
                .andExpect(jsonPath("$.authorities").value(hasItem("USER_WRITE")))
                .andExpect(jsonPath("$.authorities").value(hasItem("REFERENCE_WRITE")))
                .andExpect(jsonPath("$.authorities").value(hasItem("TEMPLATE_PLAN")))
                .andExpect(jsonPath("$.authorities").value(not(hasItem("VOLUME_READ"))));

        mvc.perform(get("/api/user/list/all").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].role").value(hasItem("admin")))
                .andExpect(content().string(not(containsString("password"))));
    }

    @Test
    void updatingCurrentUserRefreshesSessionPrincipal() throws Exception {
        MockHttpSession session = login("admin", "admin");
        UserEntity admin = users.findByUsernameIgnoreCase("admin").orElseThrow();
        String ownerId = UUID.randomUUID().toString();

        mvc.perform(put("/api/user/{id}", admin.getId())
                        .session(session)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "id": "%s",
                                  "email": "%s",
                                  "userName": "%s",
                                  "firstName": "%s",
                                  "lastName": "%s",
                                  "role": "admin",
                                  "active": true,
                                  "owners": ["%s"]
                                }
                                """.formatted(admin.getId(), admin.getEmail(), admin.getUsername(),
                                admin.getFirstName(), admin.getLastName(), ownerId)))
                .andExpect(status().isOk());

        mvc.perform(get("/api/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.owners").value(hasItem(ownerId)));
    }

    @Test
    void regularUserCannotListUsers() throws Exception {
        if (users.findByUsernameIgnoreCase("reader").isEmpty()) {
            UserEntity reader = new UserEntity();
            reader.setUsername("reader");
            reader.setEmail("reader@example.test");
            reader.setFirstName("Regular");
            reader.setLastName("Reader");
            reader.setRole(UserRole.USER);
            reader.setActive(true);
            reader.setPasswordHash(passwordEncoder.encode("reader-password"));
            users.save(reader);
        }
        MockHttpSession session = login("reader", "reader-password");
        mvc.perform(get("/api/user/list/all").session(session))
                .andExpect(status().isForbidden());
    }

    @Test
    void digitalizationRoleOnlyGetsTemplatePermissions() throws Exception {
        UserEntity user = saveUser("digitizer", UserRole.DIGITALIZATION);
        user.setPasswordHash(passwordEncoder.encode("digitizer-password"));
        users.save(user);

        MockHttpSession session = login("digitizer", "digitizer-password");
        mvc.perform(get("/api/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authorities").value(hasItem("TEMPLATE_READ")))
                .andExpect(jsonPath("$.authorities").value(hasItem("TEMPLATE_FINALIZE")))
                .andExpect(jsonPath("$.authorities").value(not(hasItem("VOLUME_WRITE"))))
                .andExpect(jsonPath("$.authorities").value(not(hasItem("USER_READ"))));
    }

    @Test
    void samlLoginReusesMigratedAccountByIssuerAndEppn() {
        String idp = "https://shibboleth.nkp.cz/idp/shibboleth";
        UserEntity migrated = saveUser("migrated@nkp.cz", UserRole.USER);
        migrated.setEmail("old@nkp.cz");
        migrated.setSamlIdpEntityId(idp);
        migrated.setSamlEppn("migrated@nkp.cz");
        users.save(migrated);
        long userCount = users.count();

        IdentityPrincipal principal = identities.provisionSaml(idp, "MIGRATED@NKP.CZ",
                "Migrated", "User", "new@nkp.cz");

        assertEquals(migrated.getId(), principal.id());
        assertEquals(userCount, users.count());
        assertEquals("new@nkp.cz", users.findById(migrated.getId()).orElseThrow().getEmail());
    }

    @Test
    void basicLoginRejectsMissingCsrfToken() throws Exception {
        mvc.perform(post("/api/auth/login/basic")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"admin\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void jwtUsesRequestedAudience() throws Exception {
        IdentityPrincipal principal = new IdentityPrincipal(UUID.randomUUID(), "jwt-user", "JWT", "User",
                "jwt-user@example.test", UserRole.DIGITALIZATION, List.of(), true, List.of("TEMPLATE_WRITE"));

        SignedJWT core = SignedJWT.parse(jwtService.create(principal, "permonik-core"));
        SignedJWT export = SignedJWT.parse(jwtService.create(principal, "permonik-export"));

        assertEquals(List.of("permonik-core"), core.getJWTClaimsSet().getAudience());
        assertEquals(List.of("permonik-export"), export.getJWTClaimsSet().getAudience());
    }

    private MockHttpSession login(String username, String password) throws Exception {
        MvcResult result = mvc.perform(post("/api/auth/login/basic")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andReturn();
        return (MockHttpSession) result.getRequest().getSession(false);
    }

    private UserEntity saveUser(String username, UserRole role) {
        return users.findByUsernameIgnoreCase(username).orElseGet(() -> {
            UserEntity user = new UserEntity();
            user.setUsername(username);
            user.setEmail(username + "@example.test");
            user.setFirstName("Test");
            user.setLastName("User");
            user.setRole(role);
            user.setActive(true);
            return users.save(user);
        });
    }
}
