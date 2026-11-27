package cz.incad.nkp.inprove.permonikapi.config.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
public class OwnerAuthorizationService {
    public void requireAccess(String ownerId) {
        var identity = CurrentIdentity.get();
        if (ownerId == null || identity == null || !identity.owners().contains(ownerId)) {
            throw new AccessDeniedException("User is not assigned to owner " + ownerId);
        }
    }
}
