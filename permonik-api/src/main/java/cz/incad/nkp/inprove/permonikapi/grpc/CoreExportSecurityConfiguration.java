package cz.incad.nkp.inprove.permonikapi.grpc;

import cz.incad.nkp.inprove.permonikcorecontract.v1.CoreExportServiceGrpc;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.grpc.server.GlobalServerInterceptor;
import org.springframework.grpc.server.security.AuthenticationProcessInterceptor;
import org.springframework.grpc.server.security.BearerTokenAuthenticationExtractor;
import org.springframework.grpc.server.security.GrpcSecurity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthenticationToken;

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(CoreExportGrpcProperties.class)
public class CoreExportSecurityConfiguration {
    /** Authenticates export independently of HTTP JWTs and permits only stored-volume reads and candidate search. */
    @Bean
    @GlobalServerInterceptor
    AuthenticationProcessInterceptor coreExportAuthentication(GrpcSecurity grpc, CoreExportGrpcProperties properties)
            throws Exception {
        byte[] expected = properties.token().getBytes(StandardCharsets.US_ASCII);
        var bearer = new BearerTokenAuthenticationExtractor();
        grpc.authenticationExtractor((headers, attributes, method) -> {
            try {
                return bearer.extract(headers, attributes, method);
            } catch (IllegalArgumentException exception) {
                throw new BadCredentialsException("Invalid service credential", exception);
            }
        });
        grpc.authenticationManager(authentication -> {
            if (!(authentication instanceof BearerTokenAuthenticationToken token)
                    || !MessageDigest.isEqual(expected, token.getToken().getBytes(StandardCharsets.US_ASCII))) {
                throw new BadCredentialsException("Service credential required");
            }
            return UsernamePasswordAuthenticationToken.authenticated("core-export", null, List.of());
        });
        grpc.authorizeRequests(requests -> requests
                .methods(CoreExportServiceGrpc.getBatchGetVolumeContentsMethod().getFullMethodName(),
                        CoreExportServiceGrpc.getSearchReplacementVolumesMethod().getFullMethodName()).authenticated()
                .allRequests().denyAll());
        return grpc.build();
    }
}
