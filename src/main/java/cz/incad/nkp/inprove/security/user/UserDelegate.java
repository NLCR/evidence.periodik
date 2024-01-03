package cz.incad.nkp.inprove.security.user;

import cz.incad.nkp.inprove.entities.user.User;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;

@Getter
@Setter
public class UserDelegate implements UserDetails {

    private User user;

    private Collection<GrantedAuthority> authorities;

    private Boolean isShibbolethAuth;

    public UserDelegate(User user, Collection<? extends GrantedAuthority> authorities, boolean isShibbolethAuth) {
        this.user = user;
        this.authorities = new HashSet<>(authorities);
        this.isShibbolethAuth = isShibbolethAuth;
    }

    public String getId() {
        return user != null ? user.getId() : null;
    }

    @Override
    public String getPassword() {
        return user != null ? user.getHeslo() : null;
    }

    @Override
    public String getUsername() {
        return user != null ? user.getUsername() : null;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
