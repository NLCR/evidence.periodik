package cz.incad.nkp.inprove.permonikapi.config.security.auth.shibboleth;

import cz.incad.nkp.inprove.permonikapi.config.security.user.UserDelegate;
import cz.incad.nkp.inprove.permonikapi.config.security.user.UserDetailsServiceImpl;
import cz.incad.nkp.inprove.permonikapi.config.security.user.UserProducer;
import cz.incad.nkp.inprove.permonikapi.user.User;
import cz.incad.nkp.inprove.permonikapi.user.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.solr.client.solrj.SolrServerException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.UUID;

import static org.springframework.security.web.context.HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY;

@Service
@Slf4j
@AllArgsConstructor
public class ShibbolethService {

    private final UserService userService;
    private final UserDetailsServiceImpl userDetailsService;

    //    private final List<String> allowedIdentityProviders = asList(
//            "https://shibboleth.mzk.cz/simplesaml/metadata.xml",
//            "https://shibboleth.nkp.cz/idp/shibboleth",
//            "https://svkul.cz/idp/shibboleth",
//            "https://shibo.vkol.cz/idp/shibboleth");

    public void shibbolethLogin(HttpServletRequest request, HttpServletResponse response) throws IOException, SolrServerException {
        String idp = request.getHeader("Shib-Identity-Provider");
//        if (!allowedIdentityProviders.contains(idp)) {
//            throw new ForbiddenException("This IDP is not allowed");
//        }

        String eppn = request.getHeader("eduPersonPrincipalName");

        User user = userService.findUserByUserName(eppn);

        if (user == null) {
            user = createNewShibbolethUser(request, eppn);
        }

        loadUserIntoSecurityContext(user, request);


        String redirectUrl = String.format("%s://%s%s/", "https", request.getServerName(), request.getContextPath());

        response.sendRedirect(redirectUrl);
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

    private User createNewShibbolethUser(HttpServletRequest request, String eppn) throws SolrServerException, IOException {
        String firstName = decodeAndRepairCaseForName(request.getHeader("firstName"));
        String lastName = decodeAndRepairCaseForName(request.getHeader("lastName"));
        String owner = eppn.split("@")[1].split("\\.")[0].toUpperCase();
        String email = request.getHeader("email");
        String eduPersonScopedAffiliation = request.getHeader("eduPersonScopedAffiliation");

        String a = request.getHeader("authorized_by_idp");

        // TODO: handle owner id from owners core
        User user = User.builder()
                .id(UUID.randomUUID().toString())
                .email(email)
                .userName(eppn)
                .firstName(firstName)
                .lastName(lastName)
                .role("user")
                .active(true)
//                .owners(List.of(owner))
                .build();


        return userService.createUser(user);
    }

    private String decodeAndRepairCaseForName(String name) {
        name = new String(name.getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.UTF_8);
        name = name.toLowerCase();
        name = Character.toUpperCase(name.charAt(0)) + name.substring(1);
        return name;
    }

    public void shibbolethLogout(HttpServletRequest request, HttpServletResponse response) throws IOException {
        UserDelegate userDelegate = UserProducer.getCurrentUserDelegate();

        // Construct the redirect URL
        String redirectUrl;
        if (userDelegate != null && userDelegate.getIsShibbolethAuth()) {
            redirectUrl = String.format("%s://%s%s/Shibboleth.sso/Logout?return=%s",
                    "https", request.getServerName(), request.getContextPath(), "/");
        } else {
            redirectUrl = String.format("%s://%s%s/",
                    "https", request.getServerName(), request.getContextPath());
        }

        // Invalidate session
        HttpSession session = request.getSession(false);
        if (session != null && request.isRequestedSessionIdValid()) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        removeSessionCookie(request, response);

        // Redirect
        response.sendRedirect(redirectUrl);
    }

    private static void removeSessionCookie(HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("SESSION")) {
                    cookie.setMaxAge(0);
                    cookie.setValue(null);
                    cookie.setPath("/");
                    cookie.setSecure(true);
                    cookie.setHttpOnly(true);
                    response.addCookie(cookie);
                }
            }
        }
    }
}
