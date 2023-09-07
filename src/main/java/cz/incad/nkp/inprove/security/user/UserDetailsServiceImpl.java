package cz.incad.nkp.inprove.security.user;

import cz.incad.nkp.inprove.entities.user.User;
import cz.incad.nkp.inprove.entities.user.UserRepository;
import cz.incad.nkp.inprove.security.user.UserDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import javax.ws.rs.NotFoundException;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;


@Service
@Primary
public class UserDetailsServiceImpl implements UserDetailsService {

    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) {
        User user = userRepository.findByUsernameIgnoreCase(username);

        if (user == null) {
            throw new NotFoundException("User not found by username");
        }

        Set<GrantedAuthority> authorities = getGrantedAuthorities(user);

        return new UserDelegate(user, authorities, false);
    }

    public static Set<GrantedAuthority> getGrantedAuthorities(User user) {
        return Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase()));
    }

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}