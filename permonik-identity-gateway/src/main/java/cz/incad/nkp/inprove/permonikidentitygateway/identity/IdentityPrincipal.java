package cz.incad.nkp.inprove.permonikidentitygateway.identity;

import java.io.Serial;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

public record IdentityPrincipal(UUID id, String username, String firstName, String lastName, String email,
                                UserRole role, List<String> owners, boolean active,
                                List<String> authorityNames) implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    static IdentityPrincipal from(UserEntity user) {
        var authorities = new ArrayList<String>();
        authorities.add("ROLE_" + user.getRole().name());
        authorities.addAll(user.getRole().permissions().stream().map(Enum::name).toList());
        return new IdentityPrincipal(user.getId(), user.getUsername(), user.getFirstName(), user.getLastName(),
                user.getEmail(), user.getRole(), List.copyOf(user.getOwners()), user.isActive(), List.copyOf(authorities));
    }

    public List<? extends GrantedAuthority> getAuthorities() {
        return authorityNames.stream().map(SimpleGrantedAuthority::new).toList();
    }
}
