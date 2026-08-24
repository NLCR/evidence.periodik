package cz.incad.nkp.inprove.permonikapi.support;

import cz.incad.nkp.inprove.permonikapi.config.security.user.UserDelegate;
import cz.incad.nkp.inprove.permonikapi.user.User;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Set;

import static org.springframework.security.core.authority.AuthorityUtils.createAuthorityList;

/**
 * Shared authentication fixture used by tests that rely on Auditable hooks.
 */
public final class TestSecuritySupport {

    public static final String TEST_USER_ID = "test-user-id";
    public static final String TEST_USERNAME = "testUser";

    private TestSecuritySupport() {
    }

    public static UsernamePasswordAuthenticationToken authentication() {
        return authenticationWithAuthorities();
    }

    public static UsernamePasswordAuthenticationToken authenticationWithAuthorities(String... authorities) {
        // Auditable entities read the currently authenticated principal (createdBy/modifiedBy).
        User user = User.builder()
            .id(TEST_USER_ID)
            .userName(TEST_USERNAME)
            .active(true)
            .build();
        var grantedAuthorities = Set.copyOf(createAuthorityList(authorities));
        UserDelegate delegate = new UserDelegate(user, grantedAuthorities, false);
        return new UsernamePasswordAuthenticationToken(delegate, null, grantedAuthorities);
    }

    public static void setAuthenticationContext() {
        SecurityContextHolder.getContext().setAuthentication(authentication());
    }

    public static void clearAuthenticationContext() {
        SecurityContextHolder.clearContext();
    }
}
