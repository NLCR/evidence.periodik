package cz.incad.nkp.inprove.permonikidentitygateway.saml

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpSession
import java.util.UUID
import org.springframework.context.annotation.Profile
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.server.ResponseStatusException
import org.springframework.web.servlet.support.ServletUriComponentsBuilder
import org.springframework.web.util.UriComponentsBuilder

@Controller
@Profile("test", "prod")
class SamlDiscoveryController(private val settings: SamlSettings) {
    @GetMapping("/login/shibboleth", "/api/auth/login/shibboleth")
    fun start(session: HttpSession): String {
        val state = UUID.randomUUID().toString()
        session.setAttribute(DISCOVERY_STATE, state)
        val callback = ServletUriComponentsBuilder.fromCurrentContextPath()
            .path("/api/auth/saml/discovery").queryParam("state", state).build().toUriString()
        val wayf = UriComponentsBuilder.fromUriString(settings.wayfUrl)
            .queryParam("entityID", settings.entityId)
            .queryParam("return", callback)
            .queryParam("returnIDParam", "entityID")
            .build().encode().toUri()
        return "redirect:$wayf"
    }

    @GetMapping("/api/auth/saml/discovery")
    fun callback(
        @RequestParam state: String,
        @RequestParam("entityID") entityId: String,
        request: HttpServletRequest,
    ): String {
        val session = request.getSession(false)
        if (session == null || state != session.getAttribute(DISCOVERY_STATE)) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid SAML discovery state")
        }
        session.removeAttribute(DISCOVERY_STATE)
        val registrationId = settings.registrations[entityId]
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Identity provider is not allowed")
        return "redirect:/saml2/authenticate/$registrationId"
    }
}

private const val DISCOVERY_STATE =
    "cz.incad.nkp.inprove.permonikidentitygateway.saml.SamlDiscoveryController.STATE"
