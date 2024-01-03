package cz.incad.nkp.inprove.security.user;

import cz.incad.nkp.inprove.entities.user.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class UserProducer {

    private UserProducer() {}

    public static UserDelegate getCurrentUserDelegate() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Object principal = authentication != null ? authentication.getPrincipal() : null;
        return principal instanceof UserDelegate ? (UserDelegate) principal : null;
    }

    public static User getCurrentUser() {
        UserDelegate currentUserDelegate = getCurrentUserDelegate();
        return currentUserDelegate != null ? currentUserDelegate.getUser() : null;
    }
}
