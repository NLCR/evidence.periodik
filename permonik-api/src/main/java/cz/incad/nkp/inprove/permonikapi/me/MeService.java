package cz.incad.nkp.inprove.permonikapi.me;

import cz.incad.nkp.inprove.permonikapi.config.security.user.UserDelegate;
import jakarta.annotation.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;

@Service
public class MeService {

    private static final Logger logger = LoggerFactory.getLogger(MeService.class);


    public Me getCurrentUser(@AuthenticationPrincipal @Nullable UserDelegate userDetails) {
        if (userDetails == null) {
            return null;
        }

        return new Me(userDetails);
    }

}
