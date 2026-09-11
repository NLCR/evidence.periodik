package cz.incad.nkp.inprove.permonikexportapi.template.persistence

import java.util.Optional
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.domain.AuditorAware
import org.springframework.data.jdbc.repository.config.EnableJdbcAuditing
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken

@Configuration(proxyBeanMethods = false)
@EnableJdbcAuditing(auditorAwareRef = "templateAuditor")
class TemplateAuditingConfiguration {
    /** Uses the authenticated user JWT subject for writes; missing or service-only identities cannot author templates. */
    @Bean
    fun templateAuditor(): AuditorAware<String> = AuditorAware {
        val authentication = SecurityContextHolder.getContext().authentication
        if (authentication !is JwtAuthenticationToken || !authentication.isAuthenticated) {
            throw AuthenticationCredentialsNotFoundException("Template writes require an authenticated user JWT")
        }
        val subject = authentication.token.subject
        if (subject.isNullOrBlank()) {
            throw AuthenticationCredentialsNotFoundException("Template writes require a user JWT subject")
        }
        Optional.of(subject)
    }
}
