package cz.incad.nkp.inprove.permonikapi.user;

import cz.incad.nkp.inprove.permonikapi.config.security.user.UserDelegate;
import cz.incad.nkp.inprove.permonikapi.config.security.user.UserDetailsServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.apache.solr.client.solrj.SolrServerException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.session.data.redis.RedisIndexedSessionRepository;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Set;

import static org.springframework.security.web.context.HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY;


@Tag(name = "User API", description = "API for managing users")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final UserDetailsServiceImpl userDetailsService;
    private final RedisIndexedSessionRepository sessionRepository;

    @Operation(summary = "Lists all users")
    @GetMapping("/list/all")
    public List<User> getUsers() throws SolrServerException, IOException {
        return userService.getUsers();
    }

    @Operation(summary = "Updates user and refreshes their active sessions")
    @PutMapping("/{id}")
    public void updateUser(@PathVariable String id, @RequestBody User user) throws SolrServerException, IOException {
        userService.updateUser(id, user);
        refreshSessions(user);
    }

    private void refreshSessions(User user) {
        Set<GrantedAuthority> newAuthorities = userDetailsService.getGrantedAuthorities(user);
        sessionRepository.findByPrincipalName(user.getUserName()).values().forEach(session -> {
            SecurityContext ctx = session.getAttribute(SPRING_SECURITY_CONTEXT_KEY);
            if (ctx != null && ctx.getAuthentication() != null && ctx.getAuthentication().getPrincipal() instanceof UserDelegate delegate) {
                delegate.setUser(user);
                delegate.setAuthorities(newAuthorities);
                session.setAttribute(SPRING_SECURITY_CONTEXT_KEY, ctx);
                sessionRepository.save(session);
            }
        });
    }

}
