package cz.incad.nkp.inprove.permonikapi.config.security;

import org.springframework.security.core.context.SecurityContextHolder;

public final class CurrentIdentity {
    private CurrentIdentity() {}

    public static InternalPrincipal get() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null
                        && authentication.getPrincipal() instanceof InternalPrincipal principal
                ? principal
                : null;
    }
}
