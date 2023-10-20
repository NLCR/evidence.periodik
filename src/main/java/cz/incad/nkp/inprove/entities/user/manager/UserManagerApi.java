package cz.incad.nkp.inprove.entities.user.manager;

import cz.incad.nkp.inprove.base.api.ApiResource;
import cz.incad.nkp.inprove.base.api.ManagerApi;
import cz.incad.nkp.inprove.entities.user.User;
import cz.incad.nkp.inprove.entities.user.dto.ResetPasswordDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.Positive;

import static cz.incad.nkp.inprove.security.permission.ResourcesConstants.USER;

@ApiResource(USER)
@RestController
@RequestMapping("/api/user")
@Tag(name = "User Manager API", description = "API for managing users")
@RequiredArgsConstructor
public class UserManagerApi implements ManagerApi<User> {

    @Getter
    private final UserManagerService service;

    @PostMapping("/reset-password")
    @Operation(summary = "Resets password of currently logged-in user")
    @PreAuthorize("isAuthenticated()")
    public void resetPassword(@RequestBody ResetPasswordDto dto) {
        service.resetPassword(dto);
    }

    @PutMapping("/{id}/change-password")
    @Operation(summary = "Changes password of user")
    @PreAuthorize("hasRole('ADMIN')")
    public void changePassword(@PathVariable String id, @RequestBody String newPassword) {
        service.changePassword(id, newPassword);
    }

}
