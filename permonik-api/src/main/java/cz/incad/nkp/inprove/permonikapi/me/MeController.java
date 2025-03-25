package cz.incad.nkp.inprove.permonikapi.me;

import cz.incad.nkp.inprove.permonikapi.config.security.user.UserDelegate;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Me API")
@RestController
@RequestMapping("/api")
public class MeController {

    private final MeService meService;

    @Autowired
    public MeController(MeService meService) {
        this.meService = meService;
    }


    @GetMapping("/me")
    public Me getCurrentUser(@AuthenticationPrincipal @Nullable UserDelegate userDetails) {
        return meService.getCurrentUser(userDetails);

    }
}
