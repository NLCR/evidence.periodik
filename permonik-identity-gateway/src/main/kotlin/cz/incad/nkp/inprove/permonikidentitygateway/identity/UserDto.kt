package cz.incad.nkp.inprove.permonikidentitygateway.identity

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import java.util.UUID

data class UserDto(
    val id: UUID,
    @field:Email @field:NotBlank val email: String,
    @field:NotBlank val userName: String,
    @field:NotBlank val firstName: String,
    @field:NotBlank val lastName: String,
    val role: UserRole,
    val active: Boolean,
    val owners: List<String>?,
)

fun UserEntity.toDto() =
    UserDto(
        id = requireNotNull(id),
        email = email,
        userName = username,
        firstName = firstName,
        lastName = lastName,
        role = role,
        active = active,
        owners = owners.toList(),
    )
