package cz.incad.nkp.inprove.permonikidentitygateway.web

import cz.incad.nkp.inprove.permonikidentitygateway.identity.IdentityPrincipal
import cz.incad.nkp.inprove.permonikidentitygateway.identity.IdentityService
import cz.incad.nkp.inprove.permonikidentitygateway.identity.UserDto
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import jakarta.validation.Valid
import java.util.UUID
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.context.SecurityContextRepository
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/user")
class UserController(
    private val identities: IdentityService,
    private val securityContexts: SecurityContextRepository,
) {
    @GetMapping("/list/all") fun list(): List<UserDto> = identities.list()

    @PutMapping("/{id}")
    fun update(
        @PathVariable id: UUID,
        @Valid @RequestBody input: UserDto,
        authentication: Authentication,
        request: HttpServletRequest,
        response: HttpServletResponse,
    ) {
        val actor =
            authentication.principal as? IdentityPrincipal
                ?: throw IllegalStateException("Authenticated identity principal is missing")
        val updated = identities.update(id, input)
        if (id == actor.id) {
            if (!updated.active) {
                SecurityContextHolder.clearContext()
                request.getSession(false)?.invalidate()
                return
            }
            val refreshed =
                UsernamePasswordAuthenticationToken.authenticated(
                    updated,
                    authentication.credentials,
                    updated.authorities,
                )
            refreshed.details = authentication.details
            val context = SecurityContextHolder.createEmptyContext()
            context.authentication = refreshed
            SecurityContextHolder.setContext(context)
            securityContexts.saveContext(context, request, response)
        }
    }
}
