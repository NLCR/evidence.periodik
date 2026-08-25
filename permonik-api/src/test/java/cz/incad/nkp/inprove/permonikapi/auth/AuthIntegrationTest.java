package cz.incad.nkp.inprove.permonikapi.auth;

import cz.incad.nkp.inprove.permonikapi.AbstractSolrIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;
import com.nimbusds.jose.JOSEObjectType;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthIntegrationTest extends AbstractSolrIntegrationTest {

    @Autowired
    MockMvc mockMvc;

    @Test
    void internalJwtAuthenticatesCoreRequest() throws Exception {
        mockMvc.perform(get("/api/owner/list/all").header("Authorization", "Bearer " + token("permonik-core")))
            .andExpect(status().isOk());
    }

    @Test
    void internalJwtRejectsWrongAudience() throws Exception {
        mockMvc.perform(get("/api/owner/list/all").header("Authorization", "Bearer " + token("permonik-export")))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void internalJwtRejectsWrongIssuer() throws Exception {
        mockMvc.perform(get("/api/owner/list/all").header("Authorization", "Bearer " + token(
                "permonik-core", "untrusted-issuer", Instant.now().plusSeconds(60),
                "permonik-api-test-jwt-secret-at-least-32-bytes")))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void internalJwtRejectsExpiredToken() throws Exception {
        mockMvc.perform(get("/api/owner/list/all").header("Authorization", "Bearer " + token(
                "permonik-core", "permonik-identity-gateway", Instant.now().minusSeconds(120),
                "permonik-api-test-jwt-secret-at-least-32-bytes")))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void internalJwtRejectsWrongSignature() throws Exception {
        mockMvc.perform(get("/api/owner/list/all").header("Authorization", "Bearer " + token(
                "permonik-core", "permonik-identity-gateway", Instant.now().plusSeconds(60),
                "different-test-signing-secret-at-least-32-bytes")))
            .andExpect(status().isUnauthorized());
    }

    private static String token(String audience) throws Exception {
        return token(audience, "permonik-identity-gateway", Instant.now().plusSeconds(60),
                "permonik-api-test-jwt-secret-at-least-32-bytes");
    }

    private static String token(String audience, String issuer, Instant expiration, String secret) throws Exception {
        Instant now = Instant.now();
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
            .issuer(issuer)
            .subject("407a3bc0-db76-4cce-aebc-4291ca5af0d3")
            .audience(audience)
            .issueTime(Date.from(now))
            .expirationTime(Date.from(expiration))
            .claim("username", "gateway-user")
            .claim("role", "admin")
            .claim("owners", List.of())
            .claim("authorities", List.of("ROLE_ADMIN", "USER_WRITE"))
            .build();
        SignedJWT jwt = new SignedJWT(new JWSHeader.Builder(JWSAlgorithm.HS256).type(JOSEObjectType.JWT).build(), claims);
        jwt.sign(new MACSigner(secret.getBytes(StandardCharsets.UTF_8)));
        return jwt.serialize();
    }
}
