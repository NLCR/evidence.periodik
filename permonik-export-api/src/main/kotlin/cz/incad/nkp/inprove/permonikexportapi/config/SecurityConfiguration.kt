package cz.incad.nkp.inprove.permonikexportapi.config

import javax.crypto.spec.SecretKeySpec
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.invoke
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator
import org.springframework.security.oauth2.core.OAuth2Error
import org.springframework.security.oauth2.core.OAuth2TokenValidator
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult
import org.springframework.security.oauth2.jose.jws.MacAlgorithm
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtValidators
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.savedrequest.NullRequestCache

@Configuration
@EnableWebSecurity
class SecurityConfiguration(private val properties: InternalJwtProperties) {
    /**
     * Configures a stateless JWT resource server with public integration and protected export
     * routes.
     */
    @Bean
    fun securityFilterChain(
        http: HttpSecurity,
        jwtAuthenticationConverter: JwtAuthenticationConverter,
    ): SecurityFilterChain {
        http {
            csrf { disable() }
            sessionManagement { sessionCreationPolicy = SessionCreationPolicy.STATELESS }
            requestCache { requestCache = NullRequestCache() }
            authorizeHttpRequests {
                authorize("/api/integration/**", permitAll)
                authorize("/api/export/**", hasAuthority("TEMPLATE_MANAGE"))
                authorize(anyRequest, denyAll)
            }
            oauth2ResourceServer {
                jwt { this.jwtAuthenticationConverter = jwtAuthenticationConverter }
            }
            httpBasic { disable() }
            formLogin { disable() }
            logout { disable() }
        }
        return http.build()
    }

    /**
     * Maps the gateway's `authorities` claim directly to Spring Security authorities without a
     * prefix.
     */
    @Bean
    fun jwtAuthenticationConverter() =
        JwtAuthenticationConverter().apply {
            setJwtGrantedAuthoritiesConverter(
                JwtGrantedAuthoritiesConverter().apply {
                    setAuthoritiesClaimName("authorities")
                    setAuthorityPrefix("")
                }
            )
        }

    /**
     * Creates the HMAC decoder and validates the internal token issuer and export-service audience.
     */
    @Bean
    fun jwtDecoder(): JwtDecoder {
        val key = properties.secret.encodeToByteArray()
        val decoder =
            NimbusJwtDecoder.withSecretKey(SecretKeySpec(key, "HmacSHA256"))
                .macAlgorithm(MacAlgorithm.HS256)
                .build()

        val audienceValidator =
            OAuth2TokenValidator<Jwt> { jwt ->
                if (jwt.audience?.contains(EXPECTED_AUDIENCE) == true) {
                    OAuth2TokenValidatorResult.success()
                } else {
                    OAuth2TokenValidatorResult.failure(
                        OAuth2Error("invalid_token", "Invalid JWT audience", null)
                    )
                }
            }
        decoder.setJwtValidator(
            DelegatingOAuth2TokenValidator(
                JwtValidators.createDefaultWithIssuer(EXPECTED_ISSUER),
                audienceValidator,
            )
        )
        return decoder
    }
}

@ConfigurationProperties("permonik.security.internal-jwt")
class InternalJwtProperties(val secret: String) {
    init {
        require(secret.encodeToByteArray().size >= 32) {
            "Internal JWT secret must contain at least 32 UTF-8 bytes"
        }
    }
}

private const val EXPECTED_ISSUER = "permonik-identity-gateway"
private const val EXPECTED_AUDIENCE = "permonik-export"
