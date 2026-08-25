package cz.incad.nkp.inprove.permonikapi.config.security.auth;

import cz.incad.nkp.inprove.permonikapi.config.ProfileManager;
import cz.incad.nkp.inprove.permonikapi.config.security.InternalJwtAuthenticationConverter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.beans.factory.annotation.Value;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity
public class PermSecurityConfiguration {

    private final ProfileManager profileManager;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtDecoder jwtDecoder,
                                           InternalJwtAuthenticationConverter jwtConverter) {
        http
            .authorizeHttpRequests((authz) -> {
                if (profileManager.isDevelopmentEnvironment()) {
                    authz
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/swagger-resources/**").permitAll()
                        .requestMatchers("/swagger-resources").permitAll();
                }
                authz
                    .requestMatchers(HttpMethod.GET, "/api/metatitle/**").permitAll()
                    .requestMatchers(HttpMethod.PUT, "/api/metatitle/**").hasAuthority("REFERENCE_WRITE")
                    .requestMatchers(HttpMethod.POST, "/api/metatitle/**").hasAuthority("REFERENCE_WRITE")
                    .requestMatchers(HttpMethod.GET, "/api/mutation/**").permitAll()
                    .requestMatchers(HttpMethod.PUT, "/api/mutation/**").hasAuthority("REFERENCE_WRITE")
                    .requestMatchers(HttpMethod.POST, "/api/mutation/**").hasAuthority("REFERENCE_WRITE")
                    .requestMatchers(HttpMethod.GET, "/api/owner/**").permitAll()
                    .requestMatchers(HttpMethod.PUT, "/api/owner/**").hasAuthority("REFERENCE_WRITE")
                    .requestMatchers(HttpMethod.POST, "/api/owner/**").hasAuthority("REFERENCE_WRITE")
                    .requestMatchers(HttpMethod.GET, "/api/edition/**").permitAll()
                    .requestMatchers(HttpMethod.PUT, "/api/edition/**").hasAuthority("REFERENCE_WRITE")
                    .requestMatchers(HttpMethod.POST, "/api/edition/**").hasAuthority("REFERENCE_WRITE")
                    .requestMatchers(HttpMethod.GET, "/api/specimen/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/specimen/**").permitAll()
                    .requestMatchers(HttpMethod.DELETE, "/api/specimen/**").hasAuthority("SPECIMEN_DELETE")
                    .requestMatchers(HttpMethod.GET, "/api/volume/**").permitAll()
                    .requestMatchers(HttpMethod.PUT, "/api/volume/**").hasAuthority("VOLUME_WRITE")
                    .requestMatchers(HttpMethod.POST, "/api/volume/**").hasAuthority("VOLUME_WRITE")
                    .requestMatchers(HttpMethod.DELETE, "/api/volume/**").hasAuthority("VOLUME_DELETE")
                    .requestMatchers("/error").permitAll()
                    .anyRequest().denyAll();
            })
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .requestCache(AbstractHttpConfigurer::disable)
            .oauth2ResourceServer(resourceServer -> resourceServer.jwt(jwt -> jwt
                    .decoder(jwtDecoder)
                    .jwtAuthenticationConverter(jwtConverter)))
            .httpBasic(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            .logout(AbstractHttpConfigurer::disable);

        return http.build();
    }

    @Bean
    JwtDecoder jwtDecoder(@Value("${permonik.security.internal-jwt.secret}") String secret) {
        byte[] key = secret.getBytes(StandardCharsets.UTF_8);
        if (key.length < 32) throw new IllegalArgumentException("Internal JWT secret must contain at least 32 UTF-8 bytes");
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(new SecretKeySpec(key, "HmacSHA256"))
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
        OAuth2TokenValidator<Jwt> audienceValidator = jwt -> jwt.getAudience().contains("permonik-core")
                ? OAuth2TokenValidatorResult.success()
                : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Invalid JWT audience", null));
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                JwtValidators.createDefaultWithIssuer("permonik-identity-gateway"), audienceValidator));
        return decoder;
    }


}
