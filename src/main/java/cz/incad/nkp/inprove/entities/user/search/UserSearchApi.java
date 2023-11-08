package cz.incad.nkp.inprove.entities.user.search;

import cz.incad.nkp.inprove.base.api.ApiResource;
import cz.incad.nkp.inprove.base.api.SearchApi;
import cz.incad.nkp.inprove.entities.user.User;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static cz.incad.nkp.inprove.security.permission.ResourcesConstants.USER;

@ApiResource(USER)
@RestController
@RequestMapping("/api/user")
@Tag(name = "User Search API", description = "API for retrieving users")
@RequiredArgsConstructor
public class UserSearchApi implements SearchApi<User> {

    @Getter
    private final UserSearchService service;

    @GetMapping("/current")
    public User getCurrentUser() {
        return service.getCurrentUser();
    }
}
