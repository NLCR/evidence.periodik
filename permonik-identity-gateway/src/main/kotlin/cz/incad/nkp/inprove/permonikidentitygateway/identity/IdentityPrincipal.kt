package cz.incad.nkp.inprove.permonikidentitygateway.identity

import java.io.Serializable
import java.util.UUID
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority

data class IdentityPrincipal(
    val id: UUID,
    val username: String,
    val firstName: String,
    val lastName: String,
    val email: String,
    val role: UserRole,
    val owners: List<String>,
    val active: Boolean,
    val authorityNames: List<String>,
) : Serializable {
    val authorities: List<GrantedAuthority>
        get() = authorityNames.map(::SimpleGrantedAuthority)

    companion object {
        private const val serialVersionUID = 1L
    }
}

fun UserEntity.toPrincipal() = IdentityPrincipal(
    id = requireNotNull(id),
    username = username,
    firstName = firstName,
    lastName = lastName,
    email = email,
    role = role,
    owners = owners.toList(),
    active = active,
    authorityNames = buildList {
        add("ROLE_${role.name}")
        addAll(role.permissions.map(Enum<*>::name))
    },
)
