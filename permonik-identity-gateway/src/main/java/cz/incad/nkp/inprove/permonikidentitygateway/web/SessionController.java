package cz.incad.nkp.inprove.permonikidentitygateway.web;

import cz.incad.nkp.inprove.permonikidentitygateway.identity.IdentityPrincipal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SessionController {
    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof IdentityPrincipal principal)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.ok(MeResponse.from(principal));
    }

    @GetMapping("/auth/csrf")
    public void csrf(CsrfToken token) {
        token.getToken();
    }

    public record MeResponse(UUID id, String name, String email, List<String> authorities, List<String> owners,
                             boolean enabled, String username, String role, boolean accountNonExpired,
                             boolean accountNonLocked, boolean credentialsNonExpired) {
        static MeResponse from(IdentityPrincipal principal) {
            return new MeResponse(principal.id(), (principal.firstName() + " " + principal.lastName()).trim(),
                    principal.email(), principal.authorityNames(), principal.owners(), principal.active(),
                    principal.username(), principal.role().value(), true, true, true);
        }
    }
}
