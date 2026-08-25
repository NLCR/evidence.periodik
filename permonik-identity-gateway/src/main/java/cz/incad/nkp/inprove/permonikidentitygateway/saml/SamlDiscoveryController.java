package cz.incad.nkp.inprove.permonikidentitygateway.saml;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.net.URI;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.util.UriComponentsBuilder;

@Controller
@Profile({"test", "prod"})
@RequiredArgsConstructor(access = AccessLevel.PACKAGE)
public class SamlDiscoveryController {
    private static final String STATE = SamlDiscoveryController.class.getName() + ".STATE";
    private final SamlSettings settings;

    @GetMapping({"/login/shibboleth", "/api/auth/login/shibboleth"})
    public String start(HttpSession session) {
        String state = UUID.randomUUID().toString();
        session.setAttribute(STATE, state);
        String callback = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/auth/saml/discovery").queryParam("state", state).build().toUriString();
        URI wayf = UriComponentsBuilder.fromUriString(settings.wayfUrl())
                .queryParam("entityID", settings.entityId())
                .queryParam("return", callback)
                .queryParam("returnIDParam", "entityID")
                .build().encode().toUri();
        return "redirect:" + wayf;
    }

    @GetMapping("/api/auth/saml/discovery")
    public String callback(@RequestParam String state, @RequestParam("entityID") String entityId,
                           HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || !state.equals(session.getAttribute(STATE))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid SAML discovery state");
        }
        session.removeAttribute(STATE);
        String registrationId = settings.registrations().get(entityId);
        if (registrationId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Identity provider is not allowed");
        }
        return "redirect:/saml2/authenticate/" + registrationId;
    }
}
