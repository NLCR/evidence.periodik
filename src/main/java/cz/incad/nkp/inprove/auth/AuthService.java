
package cz.incad.nkp.inprove.auth;

import cz.incad.nkp.inprove.entities.user.User;
import cz.incad.nkp.inprove.entities.user.UserRepo;
import cz.incad.nkp.inprove.security.user.UserDelegate;
import cz.incad.nkp.inprove.security.user.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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
import java.util.List;
import java.util.Set;

import static cz.incad.nkp.inprove.security.user.UserProducer.getCurrentUserDelegate;
import static java.util.Arrays.asList;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final UserRepo userRepository;

    private final UserDetailsServiceImpl userDetailsService;

    private final List<String> allowedIdentityProviders = asList(
            "https://shibboleth.mzk.cz/simplesaml/metadata.xml",
            "https://shibboleth.nkp.cz/idp/shibboleth",
            "https://svkul.cz/idp/shibboleth",
            "https://shibo.vkol.cz/idp/shibboleth");

    public void shibbolethLogin(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String idp = (String) request.getAttribute("Shib-Identity-Provider");
        if (!allowedIdentityProviders.contains(idp)) {
            throw new ForbiddenException("This IDP is not allowed");
        }

        String eppn = (String) request.getAttribute("eduPersonPrincipalName");

        User user = userRepository.findByUsernameIgnoreCase(eppn);
        if (user == null) {
            user = createNewShibbolethUser(request, eppn);
        }

        loadUserIntoSecurityContext(user);

        response.sendRedirect(response.encodeRedirectURL("/permonik/?shibbolethAuth=true"));
    }

    private void loadUserIntoSecurityContext(User user) {
        Set<GrantedAuthority> authorities = userDetailsService.getGrantedAuthorities(user);
        UserDelegate shibUserDelegate = new UserDelegate(user, authorities, true);
        PreAuthenticatedAuthenticationToken token = new PreAuthenticatedAuthenticationToken(
                shibUserDelegate, "", authorities);

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(token);
        SecurityContextHolder.setContext(context);
    }

    private User createNewShibbolethUser(HttpServletRequest request, String eppn) {
        String firstName = decodeAndRepairCaseForName((String) request.getAttribute("firstName"));
        String lastName = decodeAndRepairCaseForName((String) request.getAttribute("lastName"));
        String owner = eppn.split("@")[1].split("\\.")[0].toUpperCase();
        String email = (String) request.getAttribute("email");
        String eduPersonScopedAffiliation = (String) request.getAttribute("eduPersonScopedAffiliation");

        String a = (String) request.getAttribute("authorized_by_idp");

        User user = User.builder()
                .email(email)
                .username(eppn)
                .nazev(firstName + " " + lastName)
                .role("user")
                .active(true)
                .owner(owner)
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
                    cookie.setPath("/");
                    response.addCookie(cookie);
                }
            }
        }
    }
}


