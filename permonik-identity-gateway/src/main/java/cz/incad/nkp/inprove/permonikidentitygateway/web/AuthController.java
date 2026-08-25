package cz.incad.nkp.inprove.permonikidentitygateway.web;

import cz.incad.nkp.inprove.permonikidentitygateway.identity.IdentityPrincipal;
import cz.incad.nkp.inprove.permonikidentitygateway.identity.IdentityService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Profile("dev")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final IdentityService identities;
    private final SecurityContextRepository securityContexts;
    private final SessionAuthenticationStrategy sessions;

    @PostMapping("/login/basic")
    public ResponseEntity<Void> login(@Valid @RequestBody BasicLogin request, HttpServletRequest servletRequest,
                                      HttpServletResponse servletResponse) {
        IdentityPrincipal principal = identities.authenticate(request.username(), request.password());
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        var authentication = UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.getAuthorities());
        sessions.onAuthentication(authentication, servletRequest, servletResponse);
        servletRequest.getSession(true);
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContexts.saveContext(context, servletRequest, servletResponse);
        return ResponseEntity.ok().build();
    }

    public record BasicLogin(@NotBlank String username, @NotBlank String password) {}
}
