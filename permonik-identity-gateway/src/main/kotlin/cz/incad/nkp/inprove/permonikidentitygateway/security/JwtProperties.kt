package cz.incad.nkp.inprove.permonikidentitygateway.security

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties("identity.jwt")
class JwtProperties(val secret: String) {
    init {
        require(secret.toByteArray(Charsets.UTF_8).size >= 32) {
            "identity.jwt.secret must contain at least 32 UTF-8 bytes"
        }
    }

    val secretBytes: ByteArray
        get() = secret.toByteArray(Charsets.UTF_8)
}
