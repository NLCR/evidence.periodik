package cz.incad.nkp.inprove.security.user;

import cz.incad.nkp.inprove.entities.user.User;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.annotation.RequestScope;

@Configuration
public class UserProducer {

    @Bean
    @RequestScope
    public UserDelegate userDelegate() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Object principal = authentication != null ? authentication.getPrincipal() : null;
        return principal instanceof UserDelegate ? (UserDelegate) principal : null;
    }

    @Bean
    @RequestScope
    public User user(UserDelegate delegate) {
        return delegate != null ? delegate.getUser() : null;
    }
}
