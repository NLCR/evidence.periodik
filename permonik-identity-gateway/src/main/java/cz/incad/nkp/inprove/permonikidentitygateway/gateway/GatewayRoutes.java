package cz.incad.nkp.inprove.permonikidentitygateway.gateway;

import cz.incad.nkp.inprove.permonikidentitygateway.identity.IdentityPrincipal;
import cz.incad.nkp.inprove.permonikidentitygateway.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions;
import org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.servlet.function.HandlerFilterFunction;
import org.springframework.web.servlet.function.RequestPredicates;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerRequest;
import org.springframework.web.servlet.function.ServerResponse;
import java.util.List;
import java.util.Locale;

@Configuration
public class GatewayRoutes {
    private static RouterFunction<ServerResponse> webRoute(String routeId, String target, List<String> allowedHosts) {
        var predicate = RequestPredicates.path("/**").and(request -> {
            String path = request.uri().getPath();
            if (path.startsWith("/api/") || path.startsWith("/login/") || path.startsWith("/saml2/")
                    || path.startsWith("/Shibboleth.sso/") || path.startsWith("/actuator/")
                    || path.equals("/error")) return false;
            var host = request.headers().asHttpHeaders().getHost();
            return host != null && allowedHosts.contains(host.getHostString().toLowerCase(Locale.ROOT));
        });
        return GatewayRouterFunctions.route(routeId)
                .route(predicate, HandlerFunctions.http())
                .before(BeforeFilterFunctions.uri(target))
                .build();
    }

    private static HandlerFilterFunction<ServerResponse, ServerResponse> identity(JwtService jwt, String audience) {
        return (request, next) -> {
            ServerRequest.Builder builder = ServerRequest.from(request);
            builder.headers(headers -> {
                headers.remove(HttpHeaders.AUTHORIZATION);
                var authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.getPrincipal() instanceof IdentityPrincipal principal) {
                    headers.setBearerAuth(jwt.create(principal, audience));
                }
            });
            return next.handle(builder.build());
        };
    }

    @Bean
    RouterFunction<ServerResponse> coreRoutes(@Value("${gateway.core-url}") String coreUrl, JwtService jwt) {
        var corePaths = RequestPredicates.path("/api/volume/**")
                .or(RequestPredicates.path("/api/specimen/**"))
                .or(RequestPredicates.path("/api/metatitle/**"))
                .or(RequestPredicates.path("/api/mutation/**"))
                .or(RequestPredicates.path("/api/owner/**"))
                .or(RequestPredicates.path("/api/edition/**"));
        return GatewayRouterFunctions.route("permonik-core")
                .route(corePaths, HandlerFunctions.http())
                .before(BeforeFilterFunctions.uri(coreUrl))
                .filter(identity(jwt, "permonik-core"))
                .build();
    }

    @Bean
    RouterFunction<ServerResponse> exportRoutes(@Value("${gateway.export-url}") String exportUrl, JwtService jwt) {
        var exportPaths = RequestPredicates.path("/api/export/**")
                .or(RequestPredicates.path("/api/integration/**"));
        return GatewayRouterFunctions.route("permonik-export")
                .route(exportPaths, HandlerFunctions.http())
                .before(BeforeFilterFunctions.uri(exportUrl))
                .filter(identity(jwt, "permonik-export"))
                .build();
    }

    @Bean
    RouterFunction<ServerResponse> adminWebRoutes(
            @Value("${identity.web.admin-url}") String adminUrl,
            @Value("${identity.web.admin-hosts}") List<String> adminHosts) {
        return webRoute("permonik-web-admin", adminUrl, adminHosts);
    }

    @Bean
    RouterFunction<ServerResponse> publicWebRoutes(
            @Value("${identity.web.public-url}") String publicUrl,
            @Value("${identity.web.public-hosts}") List<String> publicHosts) {
        return webRoute("permonik-web-public", publicUrl, publicHosts);
    }
}
