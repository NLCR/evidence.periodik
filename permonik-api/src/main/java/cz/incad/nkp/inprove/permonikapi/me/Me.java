package cz.incad.nkp.inprove.permonikapi.me;

import cz.incad.nkp.inprove.permonikapi.config.security.user.UserDelegate;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;

import java.util.List;
import java.util.stream.Collectors;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@ToString
@Setter
@Getter
public class Me {

    private String id;
    private String name;
    private String email;
    private List<String> authorities;
    private List<String> owners;
    private Boolean enabled;
    private String username;
    private String role;
    private Boolean accountNonExpired;
    private Boolean accountNonLocked;
    private Boolean credentialsNonExpired;

    public Me(UserDelegate userDetails) {
        this.id = userDetails.getId();
        this.name = userDetails.getUser().getFirstName() + " " + userDetails.getUser().getLastName();
        this.email = userDetails.getUser().getEmail();
        this.authorities = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        this.owners = userDetails.getUser().getOwners();
        this.enabled = userDetails.isEnabled();
        this.role = userDetails.getUser().getRole();
        this.username = userDetails.getUsername();
        this.accountNonExpired = userDetails.isAccountNonExpired();
        this.accountNonLocked = userDetails.isAccountNonLocked();
        this.credentialsNonExpired = userDetails.isCredentialsNonExpired();
    }


}
