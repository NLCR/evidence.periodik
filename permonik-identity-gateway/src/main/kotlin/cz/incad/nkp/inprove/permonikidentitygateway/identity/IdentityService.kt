package cz.incad.nkp.inprove.permonikidentitygateway.identity

import java.util.UUID
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus.NOT_FOUND
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException

@Service
class IdentityService(
    private val users: UserRepository,
    private val passwordEncoder: PasswordEncoder,
) {
    @Transactional(readOnly = true)
    fun authenticate(username: String, password: String): IdentityPrincipal {
        val user =
            users
                .findByUsernameIgnoreCase(username.normalized())
                ?.takeIf(UserEntity::active)
                ?.takeIf {
                    it.passwordHash != null && passwordEncoder.matches(password, it.passwordHash)
                } ?: throw BadCredentialsException("Invalid credentials")
        return user.toPrincipal()
    }

    @Transactional(readOnly = true)
    fun list(): List<UserDto> = users.findAll().map(UserEntity::toDto)

    @Transactional
    fun update(id: UUID, input: UserDto): IdentityPrincipal {
        val user = users.findByIdOrNull(id) ?: throw ResponseStatusException(NOT_FOUND)
        val updated =
            user
                .copy(
                    username = input.userName.normalized(),
                    email = input.email.normalized(),
                    firstName = input.firstName.trim(),
                    lastName = input.lastName.trim(),
                    role = input.role,
                    active = input.active,
                )
                .withOwners(input.owners.orEmpty())
        return users.save(updated).toPrincipal()
    }

    @Transactional
    fun provisionSaml(
        idpEntityId: String,
        eppn: String,
        firstName: String,
        lastName: String,
        email: String,
    ): IdentityPrincipal {
        val username = eppn.normalized()
        val normalizedEmail = email.normalized()
        val user =
            users.findBySamlIdpEntityIdAndSamlEppn(idpEntityId, username)
                ?: users.save(
                    UserEntity(
                        username = username,
                        email = normalizedEmail,
                        firstName = firstName,
                        lastName = lastName,
                        role = UserRole.USER,
                        active = true,
                        samlIdpEntityId = idpEntityId,
                        samlEppn = username,
                    )
                )
        if (!user.active) {
            throw BadCredentialsException("User is inactive")
        }
        return users
            .save(
                user.copy(
                    username = username,
                    email = normalizedEmail,
                    firstName = firstName,
                    lastName = lastName,
                )
            )
            .toPrincipal()
    }
}

private fun String.normalized() = trim().lowercase()
