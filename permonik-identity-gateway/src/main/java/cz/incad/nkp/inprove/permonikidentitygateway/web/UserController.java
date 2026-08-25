package cz.incad.nkp.inprove.permonikidentitygateway.web;

import cz.incad.nkp.inprove.permonikidentitygateway.identity.IdentityService;
import cz.incad.nkp.inprove.permonikidentitygateway.identity.IdentityPrincipal;
import cz.incad.nkp.inprove.permonikidentitygateway.identity.UserDto;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final IdentityService identities;
    private final SecurityContextRepository securityContexts;

    @GetMapping("/list/all")
    public List<UserDto> list() {
        return identities.list();
    }

    @PutMapping("/{id}")
    public void update(@PathVariable UUID id, @Valid @RequestBody UserDto input,
                        Authentication authentication, HttpServletRequest request, HttpServletResponse response) {
        if (!(authentication.getPrincipal() instanceof IdentityPrincipal actor)) {
            throw new IllegalStateException("Authenticated identity principal is missing");
        }
        IdentityPrincipal updated = identities.update(id, input);
        if (id.equals(actor.id())) {
            if (!updated.active()) {
                SecurityContextHolder.clearContext();
                if (request.getSession(false) != null) request.getSession(false).invalidate();
                return;
            }

            var refreshed = UsernamePasswordAuthenticationToken.authenticated(
                    updated, authentication.getCredentials(), updated.getAuthorities());
            refreshed.setDetails(authentication.getDetails());
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(refreshed);
            SecurityContextHolder.setContext(context);
            securityContexts.saveContext(context, request, response);
        }
    }
}
