package cz.incad.nkp.inprove.security.user;

import cz.incad.nkp.inprove.entities.user.User;
import cz.incad.nkp.inprove.entities.user.UserRepo;
import cz.incad.nkp.inprove.security.permission.Authorities;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import javax.ws.rs.ForbiddenException;
import javax.ws.rs.NotFoundException;
import java.util.*;


@Service
@Primary
public class UserDetailsServiceImpl implements UserDetailsService {

    private UserRepo userRepository;

    private Authorities authorities;

    @Override
    public UserDetails loadUserByUsername(String username) {
        User user = userRepository.findByUsernameIgnoreCase(username);

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
        switch (role) {
            case "ROLE_ADMIN": return authorities.getAdminAuthorities();
            case "ROLE_USER": return authorities.getUserAuthorities();
            default: throw new ForbiddenException("user does not have allowed ");
        }
    }

    @Autowired
    public void setUserRepository(UserRepo userRepository) {
        this.userRepository = userRepository;
    }

    @Autowired
    public void setAuthorities(Authorities authorities) {
        this.authorities = authorities;
    }
}