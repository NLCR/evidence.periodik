package cz.incad.nkp.inprove.permonikidentitygateway.web

import cz.incad.nkp.inprove.permonikidentitygateway.identity.IdentityService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import org.springframework.context.annotation.Profile
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy
import org.springframework.security.web.context.SecurityContextRepository
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Profile("dev")
@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val identities: IdentityService,
    private val securityContexts: SecurityContextRepository,
    private val sessions: SessionAuthenticationStrategy,
) {
    @PostMapping("/login/basic")
    fun login(
        @Valid @RequestBody request: BasicLogin,
        servletRequest: HttpServletRequest,
        servletResponse: HttpServletResponse,
    ): ResponseEntity<Void> {
        val principal = identities.authenticate(request.username, request.password)
        val context = SecurityContextHolder.createEmptyContext()
        val authentication = UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.authorities)
        sessions.onAuthentication(authentication, servletRequest, servletResponse)
        servletRequest.getSession(true)
        context.authentication = authentication
        SecurityContextHolder.setContext(context)
        securityContexts.saveContext(context, servletRequest, servletResponse)
        return ResponseEntity.ok().build()
    }

    class BasicLogin(@field:NotBlank val username: String, @field:NotBlank val password: String)
}
