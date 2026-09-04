package cz.incad.nkp.inprove.permonikidentitygateway.identity

import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.context.annotation.Profile
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
@Profile("dev")
class DevIdentitySeeder(
    private val users: UserRepository,
    private val encoder: PasswordEncoder,
    private val properties: DevUserProperties,
) : ApplicationRunner {
    @Transactional
    override fun run(args: ApplicationArguments) {
        val existing = users.findByUsernameIgnoreCase(properties.username)
        val user = existing
            ?: UserEntity(
                username = properties.username,
                email = properties.email,
                firstName = "Development",
                lastName = "Administrator",
                role = UserRole.ADMIN,
                active = true,
            )
        val passwordHash = user.passwordHash?.takeIf { encoder.matches(properties.password, it) }
            ?: encoder.encode(properties.password)
        users.save(user.copy(passwordHash = passwordHash))
    }
}
