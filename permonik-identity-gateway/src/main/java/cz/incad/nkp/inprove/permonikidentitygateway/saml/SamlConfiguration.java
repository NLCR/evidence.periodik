package cz.incad.nkp.inprove.permonikidentitygateway.saml;

import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.security.saml2.core.Saml2X509Credential;
import org.springframework.security.saml2.provider.service.registration.InMemoryRelyingPartyRegistrationRepository;
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistration;
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrationRepository;
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrations;

@Configuration
@Profile({"test", "prod"})
public class SamlConfiguration {
    private static X509Certificate certificate(Resource resource) throws Exception {
        try (var input = resource.getInputStream()) {
            return (X509Certificate) CertificateFactory.getInstance("X.509").generateCertificate(input);
        }
    }

    private static PrivateKey privateKey(Resource resource) throws Exception {
        String pem;
        try (var input = resource.getInputStream()) {
            pem = new String(input.readAllBytes(), StandardCharsets.US_ASCII)
                    .replace("-----BEGIN PRIVATE KEY-----", "")
                    .replace("-----END PRIVATE KEY-----", "")
                    .replaceAll("\\s", "");
        }
        return KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(Base64.getDecoder().decode(pem)));
    }

    @Bean
    SamlSettings samlSettings(@Value("${identity.saml.entity-id}") String entityId,
                              @Value("${identity.saml.wayf-url}") String wayfUrl) {
        List<String> identityProviders = List.of(
                "https://svkul.cz/idp/shibboleth",
                "https://shibboleth.mzk.cz/simplesaml/metadata.xml",
                "https://shibboleth.nkp.cz/idp/shibboleth",
                "https://shibo.vkol.cz/idp/shibboleth");
        Map<String, String> registrations = new LinkedHashMap<>();
        for (int i = 0; i < identityProviders.size(); i++) {
            registrations.put(identityProviders.get(i), "idp-" + (i + 1));
        }
        return new SamlSettings(entityId, wayfUrl, registrations);
    }

    @Bean
    RelyingPartyRegistrationRepository relyingPartyRegistrationRepository(
            SamlSettings settings,
            @Value("${identity.saml.acs}") String acs,
            @Value("${identity.saml.metadata-url}") String metadataUrl,
            @Value("${identity.saml.signing-key}") Resource signingKey,
            @Value("${identity.saml.signing-certificate}") Resource signingCertificate) throws Exception {
        X509Certificate certificate = certificate(signingCertificate);
        PrivateKey privateKey = privateKey(signingKey);
        var signing = Saml2X509Credential.signing(privateKey, certificate);
        var decryption = Saml2X509Credential.decryption(privateKey, certificate);
        List<RelyingPartyRegistration> registrations = new ArrayList<>();
        for (var builder : RelyingPartyRegistrations.collectionFromMetadataLocation(metadataUrl)) {
            String idpEntityId = builder.build().getAssertingPartyMetadata().getEntityId();
            String registrationId = settings.registrations().get(idpEntityId);
            if (registrationId != null) {
                registrations.add(builder.registrationId(registrationId)
                        .entityId(settings.entityId())
                        .assertionConsumerServiceLocation(acs)
                        .signingX509Credentials(credentials -> credentials.add(signing))
                        .decryptionX509Credentials(credentials -> credentials.add(decryption))
                        .build());
            }
        }
        return new InMemoryRelyingPartyRegistrationRepository(registrations);
    }
}

record SamlSettings(String entityId, String wayfUrl, Map<String, String> registrations) {}
