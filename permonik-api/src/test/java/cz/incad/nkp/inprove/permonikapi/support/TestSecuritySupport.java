package cz.incad.nkp.inprove.permonikapi.support;

import static org.springframework.security.core.authority.AuthorityUtils.createAuthorityList;

import cz.incad.nkp.inprove.permonikapi.config.security.InternalPrincipal;
import java.util.List;
import java.util.Set;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

/** Shared authentication fixture used by tests that rely on Auditable hooks. */
public final class TestSecuritySupport {

    public static final String TEST_USER_ID = "test-user-id";
    public static final String TEST_USERNAME = "testUser";

    private TestSecuritySupport() {}

    public static UsernamePasswordAuthenticationToken authentication() {
        return authenticationWithAuthorities();
    }

    public static UsernamePasswordAuthenticationToken authenticationWithAuthorities(
            String... authorities) {
        return authentication(
                List.of(SolrFixtureFactory.ReferenceData.OWNER_ID, "owner-1"), authorities);
    }

    public static UsernamePasswordAuthenticationToken authenticationForOwners(String... ownerIds) {
        return authentication(List.of(ownerIds));
    }

    private static UsernamePasswordAuthenticationToken authentication(
            List<String> ownerIds, String... authorities) {
        // Auditable entities read the currently authenticated principal (createdBy/modifiedBy).
        var principal = new InternalPrincipal(TEST_USER_ID, TEST_USERNAME, "user", ownerIds);
        var grantedAuthorities = Set.copyOf(createAuthorityList(authorities));
        return new UsernamePasswordAuthenticationToken(principal, null, grantedAuthorities);
    }

    public static void setAuthenticationContext() {
        SecurityContextHolder.getContext().setAuthentication(authentication());
    }

    public static void setAuthenticationContextForOwners(String... ownerIds) {
        SecurityContextHolder.getContext().setAuthentication(authenticationForOwners(ownerIds));
    }

    public static void clearAuthenticationContext() {
        SecurityContextHolder.clearContext();
    }
}
