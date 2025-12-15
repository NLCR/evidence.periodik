package cz.incad.nkp.inprove.permonikapi.me;

import cz.incad.nkp.inprove.permonikapi.config.security.user.UserDelegate;
import jakarta.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MeService {


    public Me getCurrentUser(@AuthenticationPrincipal @Nullable UserDelegate userDetails) {
        if (userDetails == null) {
            return null;
        }

        return new Me(userDetails);
    }

}
