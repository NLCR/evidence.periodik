package cz.incad.nkp.inprove.permonikidentitygateway.identity;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record UserDto(
        @NotNull UUID id,
        @Email @NotBlank String email,
        @NotBlank String userName,
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotNull UserRole role,
        boolean active,
        List<String> owners) {

    static UserDto from(UserEntity user) {
        return new UserDto(user.getId(), user.getEmail(), user.getUsername(), user.getFirstName(),
                user.getLastName(), user.getRole(), user.isActive(), List.copyOf(user.getOwners()));
    }
}
