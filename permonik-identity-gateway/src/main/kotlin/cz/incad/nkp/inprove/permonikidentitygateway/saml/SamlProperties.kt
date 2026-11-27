package cz.incad.nkp.inprove.permonikidentitygateway.saml

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.core.io.Resource

@ConfigurationProperties("identity.saml")
data class SamlProperties(
    val entityId: String,
    val acs: String,
    val signingKey: Resource,
    val signingCertificate: Resource,
    val metadataUrl: String,
    val wayfUrl: String,
)
