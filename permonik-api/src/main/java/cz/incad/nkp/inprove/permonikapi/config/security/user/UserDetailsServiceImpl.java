package cz.incad.nkp.inprove.permonikapi.config.security.user;


import cz.incad.nkp.inprove.permonikapi.config.security.permission.Authorities;
import cz.incad.nkp.inprove.permonikapi.user.User;
import cz.incad.nkp.inprove.permonikapi.user.UserService;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;


@Service
@Primary
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserService userService;

    private final Authorities authorities;

    @Autowired
    public UserDetailsServiceImpl(UserService userService, Authorities authorities) {
        this.userService = userService;
        this.authorities = authorities;
    }


    @SneakyThrows
    @Override
    public UserDetails loadUserByUsername(String userName) {

        User user = userService.findUserByUserName(userName);


        if (user == null) {
            throw new NotFoundException("User not found by username");
        }

        Set<GrantedAuthority> authorities = getGrantedAuthorities(user);


        return new UserDelegate(user, authorities, false);
    }

    public Set<GrantedAuthority> getGrantedAuthorities(User user) {
        Set<GrantedAuthority> grantedAuthorities = new HashSet<>();

        String role = "ROLE_" + user.getRole().toUpperCase();
        grantedAuthorities.add(new SimpleGrantedAuthority(role));

        grantedAuthorities.addAll(getAuthoritiesForRole(role));

        return grantedAuthorities;
    }

    private Collection<? extends GrantedAuthority> getAuthoritiesForRole(String role) {
        return switch (role) {
            case "ROLE_ADMIN" -> authorities.getAdminAuthorities();
            case "ROLE_USER" -> authorities.getUserAuthorities();
            default -> throw new ForbiddenException("user does not have allowed ");
        };
    }

}
