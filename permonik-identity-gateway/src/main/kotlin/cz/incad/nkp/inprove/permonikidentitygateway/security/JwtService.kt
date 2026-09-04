package cz.incad.nkp.inprove.permonikidentitygateway.security

import com.nimbusds.jose.JOSEObjectType
import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.JWSHeader
import com.nimbusds.jose.crypto.MACSigner
import com.nimbusds.jwt.JWTClaimsSet
import com.nimbusds.jwt.SignedJWT
import cz.incad.nkp.inprove.permonikidentitygateway.identity.IdentityPrincipal
import java.time.Instant
import java.util.Date
import org.springframework.stereotype.Service

@Service
class JwtService(private val properties: JwtProperties) {
    fun create(principal: IdentityPrincipal, audience: String): String = try {
        val now = Instant.now()
        val claims = JWTClaimsSet.Builder()
            .issuer("permonik-identity-gateway")
            .subject(principal.id.toString())
            .audience(audience)
            .issueTime(Date.from(now))
            .expirationTime(Date.from(now.plusSeconds(60)))
            .claim("username", principal.username)
            .claim("role", principal.role.value)
            .claim("owners", principal.owners)
            .claim("authorities", principal.authorityNames)
            .build()
        SignedJWT(JWSHeader.Builder(JWSAlgorithm.HS256).type(JOSEObjectType.JWT).build(), claims).apply {
            sign(MACSigner(properties.secretBytes))
        }.serialize()
    } catch (exception: Exception) {
        throw IllegalStateException("Could not sign internal JWT", exception)
    }
}
