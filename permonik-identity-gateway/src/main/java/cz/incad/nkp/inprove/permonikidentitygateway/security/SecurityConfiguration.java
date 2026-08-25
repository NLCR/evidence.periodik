package cz.incad.nkp.inprove.permonikidentitygateway.security;

import cz.incad.nkp.inprove.permonikidentitygateway.saml.SamlAuthenticationSuccessHandler;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.saml2.provider.service.registration.RelyingPartyRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfAuthenticationStrategy;
import org.springframework.security.web.authentication.session.ChangeSessionIdAuthenticationStrategy;
import org.springframework.security.web.authentication.session.CompositeSessionAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import java.util.List;

@Configuration
public class SecurityConfiguration {
    @Bean
    SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        ObjectProvider<RelyingPartyRegistrationRepository> relyingParties,
        ObjectProvider<SamlAuthenticationSuccessHandler> samlSuccessHandler,
        CookieCsrfTokenRepository csrf) {

        http
            .securityContext(context -> context.securityContextRepository(securityContextRepository()))
            .csrf(configurer -> configurer.spa().csrfTokenRepository(csrf))
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(
                    "/api/auth/**",
                    "/api/me",
                    "/error",
                    "/Shibboleth.sso/**",
                    "/login/shibboleth",
                    "/saml2/**",
                    "/login/saml2/**")
                .permitAll()
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
                    "/api/integration/**")
                .permitAll()
                .requestMatchers("/api/**").denyAll()
                .anyRequest().permitAll())
                .logout(logout -> logout.logoutUrl("/api/auth/logout").logoutSuccessHandler(
                    (_, response, _) -> response.setStatus(200))
                );

        RelyingPartyRegistrationRepository repository = relyingParties.getIfAvailable();
        SamlAuthenticationSuccessHandler successHandler = samlSuccessHandler.getIfAvailable();

        if (repository != null && successHandler != null) {
            http.saml2Login(saml -> saml.relyingPartyRegistrationRepository(repository)
                    .loginProcessingUrl("/Shibboleth.sso/SAML2/POST")
                    .successHandler(successHandler));
        }

        return http.build();
    }

    @Bean
    SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    CookieCsrfTokenRepository csrfTokenRepository() {
        return CookieCsrfTokenRepository.withHttpOnlyFalse();
    }

    @Bean
    SessionAuthenticationStrategy sessionAuthenticationStrategy(CookieCsrfTokenRepository csrf) {
        return new CompositeSessionAuthenticationStrategy(List.of(
                new ChangeSessionIdAuthenticationStrategy(),
                new CsrfAuthenticationStrategy(csrf)));
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
