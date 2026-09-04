package cz.incad.nkp.inprove.permonikidentitygateway.security

import cz.incad.nkp.inprove.permonikidentitygateway.saml.SamlAuthenticationSuccessHandler
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrationRepository
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.session.ChangeSessionIdAuthenticationStrategy
import org.springframework.security.web.authentication.session.CompositeSessionAuthenticationStrategy
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy
import org.springframework.security.web.context.HttpSessionSecurityContextRepository
import org.springframework.security.web.context.SecurityContextRepository
import org.springframework.security.web.csrf.CookieCsrfTokenRepository
import org.springframework.security.web.csrf.CsrfAuthenticationStrategy

@Configuration
class SecurityConfiguration {
    @Bean
    fun securityFilterChain(
        http: HttpSecurity,
        relyingParties: RelyingPartyRegistrationRepository?,
        samlSuccessHandler: SamlAuthenticationSuccessHandler?,
        csrf: CookieCsrfTokenRepository,
        securityContexts: SecurityContextRepository,
    ): SecurityFilterChain {
        http
            .securityContext { it.securityContextRepository(securityContexts) }
            .csrf { it.spa().csrfTokenRepository(csrf) }
            .authorizeHttpRequests {
                it.requestMatchers(
                    "/api/auth/**",
                    "/api/me",
                    "/error",
                    "/Shibboleth.sso/**",
                    "/login/shibboleth",
                    "/saml2/**",
                    "/login/saml2/**",
                ).permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/user/**").hasAuthority("USER_READ")
                    .requestMatchers(HttpMethod.PUT, "/api/user/**").hasAuthority("USER_WRITE")
                    .requestMatchers(
                        "/api/volume/**",
                        "/api/specimen/**",
                        "/api/metatitle/**",
                        "/api/mutation/**",
                        "/api/owner/**",
                        "/api/edition/**",
                        "/api/export/**",
                    ).permitAll()
                    .requestMatchers("/api/**").denyAll()
                    .anyRequest().permitAll()
            }
            .logout { it.logoutUrl("/api/auth/logout").logoutSuccessHandler { _, response, _ -> response.status = 200 } }

        if (relyingParties != null && samlSuccessHandler != null) {
            http.saml2Login {
                it.relyingPartyRegistrationRepository(relyingParties)
                    .loginProcessingUrl("/Shibboleth.sso/SAML2/POST")
                    .successHandler(samlSuccessHandler)
            }
        }
        return http.build()
    }

    @Bean
    fun securityContextRepository(): SecurityContextRepository = HttpSessionSecurityContextRepository()

    @Bean
    fun csrfTokenRepository(): CookieCsrfTokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse()

    @Bean
    fun sessionAuthenticationStrategy(csrf: CookieCsrfTokenRepository): SessionAuthenticationStrategy =
        CompositeSessionAuthenticationStrategy(
            listOf(ChangeSessionIdAuthenticationStrategy(), CsrfAuthenticationStrategy(csrf)),
        )

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()
}
