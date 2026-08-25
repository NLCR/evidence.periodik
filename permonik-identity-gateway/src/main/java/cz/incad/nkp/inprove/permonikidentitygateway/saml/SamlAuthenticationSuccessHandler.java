package cz.incad.nkp.inprove.permonikidentitygateway.saml;

import cz.incad.nkp.inprove.permonikidentitygateway.identity.IdentityPrincipal;
import cz.incad.nkp.inprove.permonikidentitygateway.identity.IdentityService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Objects;

import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.saml2.provider.service.authentication.Saml2AssertionAuthentication;
import org.springframework.security.saml2.provider.service.authentication.Saml2ResponseAssertionAccessor;
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrationRepository;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Component;

@Component
@Profile({"test", "prod"})
@RequiredArgsConstructor
public class SamlAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private final IdentityService identities;
    private final SecurityContextRepository securityContexts;
    private final RelyingPartyRegistrationRepository relyingParties;

    private static String required(Saml2ResponseAssertionAccessor assertion, String... aliases) {
        for (String alias : aliases) {
            Object value = assertion.getFirstAttribute(alias);
            if (value != null && !value.toString().isBlank()) {
                return value.toString().trim();
            }
        }
        throw new IllegalArgumentException("Required SAML attribute is missing: " + aliases[0]);
    }

    @Override
    public void onAuthenticationSuccess(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
                                        @NonNull Authentication authentication) throws IOException {
        if (!(authentication instanceof Saml2AssertionAuthentication saml)) {
            throw new IllegalArgumentException("Unsupported SAML authentication type");
        }
        Saml2ResponseAssertionAccessor assertion = saml.getCredentials();
        String username = required(assertion, "eduPersonPrincipalName", "eppn", "urn:oid:1.3.6.1.4.1.5923.1.1.1.6");
        String firstName = required(assertion, "givenName", "urn:oid:2.5.4.42");
        String lastName = required(assertion, "sn", "surname", "urn:oid:2.5.4.4");
        String email = required(assertion, "mail", "email", "urn:oid:0.9.2342.19200300.100.1.3");
        String registrationId = Objects.requireNonNull(saml.getRelyingPartyRegistrationId(),
                "SAML relying party registration ID is missing");
        var registration = relyingParties.findByRegistrationId(registrationId);
        if (registration == null) throw new IllegalArgumentException("Unknown SAML relying party registration");
        String idpEntityId = registration.getAssertingPartyMetadata().getEntityId();
        IdentityPrincipal principal = identities.provisionSaml(idpEntityId, username, firstName, lastName, email);
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.getAuthorities()));
        SecurityContextHolder.setContext(context);
        securityContexts.saveContext(context, request, response);
        response.sendRedirect("/");
    }
}
