package cz.incad.nkp.inprove.permonikexportapi.config

import com.nimbusds.jose.JOSEObjectType
import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.JWSHeader
import com.nimbusds.jose.crypto.MACSigner
import com.nimbusds.jwt.JWTClaimsSet
import com.nimbusds.jwt.SignedJWT
import java.time.Instant
import java.util.Date
import org.junit.jupiter.api.Assertions.assertDoesNotThrow
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.springframework.security.oauth2.jwt.JwtValidationException

class SecurityConfigurationTest {
    private val decoder = SecurityConfiguration(InternalJwtProperties(SECRET)).jwtDecoder()

    @Test
    fun acceptsOnlyExportAudience() {
        assertDoesNotThrow { decoder.decode(token("permonik-export")) }
        assertThrows(JwtValidationException::class.java) { decoder.decode(token("permonik-core")) }
    }

    private fun token(audience: String): String {
        val now = Instant.now()
        val claims = JWTClaimsSet.Builder()
            .issuer("permonik-identity-gateway")
            .subject("test-user")
            .audience(audience)
            .issueTime(Date.from(now))
            .expirationTime(Date.from(now.plusSeconds(60)))
            .build()
        return SignedJWT(
            JWSHeader.Builder(JWSAlgorithm.HS256).type(JOSEObjectType.JWT).build(),
            claims,
        ).apply {
            sign(MACSigner(SECRET.encodeToByteArray()))
        }.serialize()
    }
}

private const val SECRET = "export-api-test-secret-at-least-32-bytes"
