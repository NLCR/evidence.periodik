package cz.incad.nkp.inprove.permonikidentitygateway.saml

import cz.incad.nkp.inprove.permonikidentitygateway.identity.IdentityService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Profile
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.saml2.provider.service.authentication.Saml2AssertionAuthentication
import org.springframework.security.saml2.provider.service.authentication.Saml2ResponseAssertionAccessor
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrationRepository
import org.springframework.security.web.authentication.AuthenticationSuccessHandler
import org.springframework.security.web.context.SecurityContextRepository
import org.springframework.stereotype.Component

@Component
@Profile("test", "prod")
class SamlAuthenticationSuccessHandler(
    private val identities: IdentityService,
    private val securityContexts: SecurityContextRepository,
    private val relyingParties: RelyingPartyRegistrationRepository,
) : AuthenticationSuccessHandler {
    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication,
    ) {
        val saml = authentication as? Saml2AssertionAuthentication
            ?: throw IllegalArgumentException("Unsupported SAML authentication type")
        val assertion = saml.credentials
        val username = required(assertion, "eduPersonPrincipalName", "eppn", "urn:oid:1.3.6.1.4.1.5923.1.1.1.6")
        val firstName = required(assertion, "givenName", "urn:oid:2.5.4.42")
        val lastName = required(assertion, "sn", "surname", "urn:oid:2.5.4.4")
        val email = required(assertion, "mail", "email", "urn:oid:0.9.2342.19200300.100.1.3")
        val registrationId = requireNotNull(saml.relyingPartyRegistrationId) {
            "SAML relying party registration ID is missing"
        }
        val registration = relyingParties.findByRegistrationId(registrationId)
            ?: throw IllegalArgumentException("Unknown SAML relying party registration")
        val principal = identities.provisionSaml(
            registration.assertingPartyMetadata.entityId,
            username,
            firstName,
            lastName,
            email,
        )
        val context = SecurityContextHolder.createEmptyContext()
        context.authentication = UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.authorities)
        SecurityContextHolder.setContext(context)
        securityContexts.saveContext(context, request, response)
        response.sendRedirect("/")
    }

    private fun required(assertion: Saml2ResponseAssertionAccessor, vararg aliases: String): String {
        return aliases.firstNotNullOfOrNull { alias ->
            assertion.getFirstAttribute<Any>(alias)?.toString()?.trim()?.takeIf(String::isNotBlank)
        } ?: throw IllegalArgumentException("Required SAML attribute is missing: ${aliases.first()}")
    }
}
