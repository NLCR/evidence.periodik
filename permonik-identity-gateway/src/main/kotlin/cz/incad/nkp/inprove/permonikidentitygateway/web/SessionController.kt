package cz.incad.nkp.inprove.permonikidentitygateway.web

import cz.incad.nkp.inprove.permonikidentitygateway.identity.IdentityPrincipal
import java.util.UUID
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.security.web.csrf.CsrfToken
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api")
class SessionController {
    @GetMapping("/me")
    fun me(authentication: Authentication?): ResponseEntity<MeResponse> {
        val principal = authentication?.principal as? IdentityPrincipal ?: return ResponseEntity.ok().build()
        return ResponseEntity.ok(principal.toMeResponse())
    }

    @GetMapping("/auth/csrf")
    fun csrf(token: CsrfToken) {
        token.token
    }

}

data class MeResponse(
    val id: UUID,
    val name: String,
    val email: String,
    val authorities: List<String>,
    val owners: List<String>,
    val enabled: Boolean,
    val username: String,
    val role: String,
    val accountNonExpired: Boolean,
    val accountNonLocked: Boolean,
    val credentialsNonExpired: Boolean,
)

private fun IdentityPrincipal.toMeResponse() = MeResponse(
    id = id,
    name = "$firstName $lastName".trim(),
    email = email,
    authorities = authorityNames,
    owners = owners,
    enabled = active,
    username = username,
    role = role.value,
    accountNonExpired = true,
    accountNonLocked = true,
    credentialsNonExpired = true,
)
