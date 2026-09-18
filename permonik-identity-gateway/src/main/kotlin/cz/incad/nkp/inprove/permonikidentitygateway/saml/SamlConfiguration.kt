package cz.incad.nkp.inprove.permonikidentitygateway.saml

import java.security.KeyFactory
import java.security.PrivateKey
import java.security.cert.CertificateFactory
import java.security.cert.X509Certificate
import java.security.spec.PKCS8EncodedKeySpec
import java.util.Base64
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.core.io.Resource
import org.springframework.security.saml2.core.Saml2X509Credential
import org.springframework.security.saml2.provider.service.registration.InMemoryRelyingPartyRegistrationRepository
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrationRepository
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrations

@Configuration
@Profile("test", "prod")
class SamlConfiguration(private val properties: SamlProperties) {
    @Bean
    fun samlSettings(): SamlSettings {
        val identityProviders =
            listOf(
                "https://svkul.cz/idp/shibboleth",
                "https://shibboleth.mzk.cz/simplesaml/metadata.xml",
                "https://shibboleth.nkp.cz/idp/shibboleth",
                "https://shibo.vkol.cz/idp/shibboleth",
            )
        return SamlSettings(
            properties.entityId,
            properties.wayfUrl,
            identityProviders.mapIndexed { index, idp -> idp to "idp-${index + 1}" }.toMap(),
        )
    }

    @Bean
    fun relyingPartyRegistrationRepository(
        settings: SamlSettings
    ): RelyingPartyRegistrationRepository {
        val certificate = certificate(properties.signingCertificate)
        val privateKey = privateKey(properties.signingKey)
        val signing = Saml2X509Credential.signing(privateKey, certificate)
        val decryption = Saml2X509Credential.decryption(privateKey, certificate)
        val registrations =
            RelyingPartyRegistrations.collectionFromMetadataLocation(properties.metadataUrl)
                .mapNotNull { builder ->
                    val idpEntityId = builder.build().assertingPartyMetadata.entityId
                    val registrationId =
                        settings.registrations[idpEntityId] ?: return@mapNotNull null
                    builder
                        .registrationId(registrationId)
                        .entityId(settings.entityId)
                        .assertionConsumerServiceLocation(properties.acs)
                        .signingX509Credentials { it.add(signing) }
                        .decryptionX509Credentials { it.add(decryption) }
                        .build()
                }
        return InMemoryRelyingPartyRegistrationRepository(registrations)
    }
}

data class SamlSettings(
    val entityId: String,
    val wayfUrl: String,
    val registrations: Map<String, String>,
)

private fun certificate(resource: Resource): X509Certificate =
    resource.inputStream.use {
        CertificateFactory.getInstance("X.509").generateCertificate(it) as X509Certificate
    }

private fun privateKey(resource: Resource): PrivateKey {
    val pem =
        resource.inputStream
            .use { it.readBytes().toString(Charsets.US_ASCII) }
            .replace("-----BEGIN PRIVATE KEY-----", "")
            .replace("-----END PRIVATE KEY-----", "")
            .replace(Regex("\\s"), "")
    return KeyFactory.getInstance("RSA")
        .generatePrivate(PKCS8EncodedKeySpec(Base64.getDecoder().decode(pem)))
}
