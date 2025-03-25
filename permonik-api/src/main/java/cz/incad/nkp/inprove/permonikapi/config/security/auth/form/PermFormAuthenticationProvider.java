package cz.incad.nkp.inprove.permonikapi.config.security.auth.form;

import cz.incad.nkp.inprove.permonikapi.config.security.auth.PasswordEncoderFactory;
import cz.incad.nkp.inprove.permonikapi.config.security.user.UserDetailsServiceImpl;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.AbstractUserDetailsAuthenticationProvider;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class PermFormAuthenticationProvider extends AbstractUserDetailsAuthenticationProvider {


    private final UserDetailsServiceImpl userDetailsService;
    private final PasswordEncoderFactory passwordEncoderFactory;


    @Override
    protected void additionalAuthenticationChecks(UserDetails userDetails, UsernamePasswordAuthenticationToken authentication) throws AuthenticationException {
        String rawPassword = authentication.getCredentials().toString();
        String encodedPassword = userDetails.getPassword();

        if (!passwordEncoderFactory.passwordEncoder().matches(rawPassword, encodedPassword)) {
            throw new BadCredentialsException("Invalid password");
        }
    }

    @Override
    protected UserDetails retrieveUser(String username, UsernamePasswordAuthenticationToken authentication) throws AuthenticationException {
        return userDetailsService.loadUserByUsername(username);
    }
}
