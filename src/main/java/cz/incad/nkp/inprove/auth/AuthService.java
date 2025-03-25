
package cz.incad.nkp.inprove.auth;

import cz.incad.nkp.inprove.entities.user.Owner;
import cz.incad.nkp.inprove.entities.user.User;
import cz.incad.nkp.inprove.entities.user.UserRepo;
import cz.incad.nkp.inprove.security.user.UserDelegate;
import cz.incad.nkp.inprove.security.user.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.stereotype.Service;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.ws.rs.ForbiddenException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Arrays;
import java.util.Set;
import java.util.UUID;

import static cz.incad.nkp.inprove.security.user.UserProducer.getCurrentUserDelegate;
import static org.springframework.security.web.context.HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final UserRepo userRepository;

    private final UserDetailsServiceImpl userDetailsService;

    public void shibbolethLogin(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String idp = (String) request.getAttribute("Shib-Identity-Provider");

        Owner owner = Arrays.stream(Owner.values())
                .filter(o -> o.getUrl().equals(idp))
                .findAny().orElse(null);

        if (owner == null) {
            throw new ForbiddenException("This IDP is not allowed");
        }

        String eppn = (String) request.getAttribute("eduPersonPrincipalName");
        User user = userRepository.findByUsernameIgnoreCase(eppn);
        if (user == null) {
            user = createNewShibbolethUser(request, eppn, owner);
        }

        loadUserIntoSecurityContext(user, request);

        response.sendRedirect(response.encodeRedirectURL("/permonik/?shibbolethAuth=true"));
    }

    private void loadUserIntoSecurityContext(User user, HttpServletRequest request) {
        Set<GrantedAuthority> authorities = userDetailsService.getGrantedAuthorities(user);
        UserDelegate shibUserDelegate = new UserDelegate(user, authorities, true);
        PreAuthenticatedAuthenticationToken token = new PreAuthenticatedAuthenticationToken(
                shibUserDelegate, "", authorities);

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(token);
        SecurityContextHolder.setContext(context);
        HttpSession session = request.getSession(true);
        session.setAttribute(SPRING_SECURITY_CONTEXT_KEY, context);
    }

    private User createNewShibbolethUser(HttpServletRequest request, String eppn, Owner owner) {
        String firstName = decodeAndRepairCaseForName((String) request.getAttribute("firstName"));
        String lastName = decodeAndRepairCaseForName((String) request.getAttribute("lastName"));
        String email = (String) request.getAttribute("email");

//        String eduPersonScopedAffiliation = (String) request.getAttribute("eduPersonScopedAffiliation");
//        String a = (String) request.getAttribute("authorized_by_idp");

        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .email(email)
                .username(eppn)
                .nazev(firstName + " " + lastName)
                .role("user")
                .active(true)
                .owner(owner.getId())
                .build();

        return userRepository.save(user, Duration.ZERO);
    }

    private String decodeAndRepairCaseForName(String name) {
        name = new String(name.getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.UTF_8);
        name = name.toLowerCase();
        name = Character.toUpperCase(name.charAt(0)) + name.substring(1);
        return name;
    }

    public void shibbolethLogout(HttpServletRequest request, HttpServletResponse response) throws IOException {
        UserDelegate userDelegate = getCurrentUserDelegate();
        String redirectUrl = userDelegate != null && userDelegate.getIsShibbolethAuth() ?
                "/Shibboleth.sso/Logout?return=/" : "/";

        HttpSession session = request.getSession(false);
        if (session != null && request.isRequestedSessionIdValid()) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        removeSessionCookie(request, response);

        response.sendRedirect(response.encodeRedirectURL(redirectUrl));
    }

    private static void removeSessionCookie(HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("JSESSIONID")) {
                    cookie.setMaxAge(0);
                    cookie.setValue(null);
                    cookie.setPath("/permonik");
                    cookie.setHttpOnly(true);
                    response.addCookie(cookie);
                }
            }
        }
    }
}


