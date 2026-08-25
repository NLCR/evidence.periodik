package cz.incad.nkp.inprove.permonikapi.config.security;

import java.security.Principal;
import java.util.List;

public record InternalPrincipal(String id, String username, String role, List<String> owners) implements Principal {
    public InternalPrincipal {
        owners = List.copyOf(owners);
    }

    @Override
    public String getName() {
        return username;
    }
}
