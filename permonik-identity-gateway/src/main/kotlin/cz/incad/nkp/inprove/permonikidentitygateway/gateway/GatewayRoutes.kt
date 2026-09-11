package cz.incad.nkp.inprove.permonikidentitygateway.gateway

import cz.incad.nkp.inprove.permonikidentitygateway.identity.IdentityPrincipal
import cz.incad.nkp.inprove.permonikidentitygateway.security.JwtService
import org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions
import org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions
import org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpHeaders
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.servlet.function.HandlerFilterFunction
import org.springframework.web.servlet.function.RequestPredicates
import org.springframework.web.servlet.function.RouterFunction
import org.springframework.web.servlet.function.ServerRequest
import org.springframework.web.servlet.function.ServerResponse

@Configuration
class GatewayRoutes(
    private val gateway: GatewayProperties,
    private val web: WebProperties,
    private val jwt: JwtService,
) {
    @Bean
    fun coreRoutes(): RouterFunction<ServerResponse> {
        val corePaths = RequestPredicates.path("/api/volume/**")
            .or(RequestPredicates.path("/api/specimen/**"))
            .or(RequestPredicates.path("/api/metatitle/**"))
            .or(RequestPredicates.path("/api/mutation/**"))
            .or(RequestPredicates.path("/api/owner/**"))
            .or(RequestPredicates.path("/api/edition/**"))
        return GatewayRouterFunctions.route("permonik-core")
            .route(corePaths, HandlerFunctions.http())
            .before(BeforeFilterFunctions.uri(gateway.coreUrl))
            .filter(identity(jwt, "permonik-core"))
            .build()
    }

    @Bean
    fun exportRoutes(): RouterFunction<ServerResponse> {
        val exportPaths = RequestPredicates.path("/api/export/**")
            .or(RequestPredicates.path("/api/integration/**"))

        return GatewayRouterFunctions.route("permonik-export")
            .route(exportPaths, HandlerFunctions.http())
            .before(BeforeFilterFunctions.uri(gateway.exportUrl))
            .filter(identity(jwt, "permonik-export"))
            .build()
    }

    @Bean
    fun adminWebRoutes(): RouterFunction<ServerResponse> =
        webRoute("permonik-web-admin", web.adminUrl, web.adminHosts)

    @Bean
    fun publicWebRoutes(): RouterFunction<ServerResponse> =
        webRoute("permonik-web-public", web.publicUrl, web.publicHosts)
}

private val identityHeaders = listOf(
    "Remote-User",
    "X-Remote-User",
    "X-Forwarded-User",
    "X-Authenticated-User",
    "Shib-Session-ID",
    "Shib-Identity-Provider",
    "eppn",
    "eduPersonPrincipalName",
    "eduPersonScopedAffiliation",
    "mail",
    "givenName",
    "sn",
)

private fun webRoute(routeId: String, target: String, allowedHosts: List<String>): RouterFunction<ServerResponse> {
    val predicate = RequestPredicates.path("/**").and { request ->
        val path = request.uri().path
        val reserved = path.startsWith("/api/") || path.startsWith("/login/") || path.startsWith("/saml2/") ||
            path.startsWith("/Shibboleth.sso/") || path.startsWith("/actuator/") || path == "/error"
        !reserved && request.headers().asHttpHeaders().host?.hostString?.lowercase() in allowedHosts
    }
    return GatewayRouterFunctions.route(routeId)
        .route(predicate, HandlerFunctions.http())
        .before(BeforeFilterFunctions.uri(target))
        .build()
}

private fun identity(jwt: JwtService, audience: String) =
    HandlerFilterFunction { request, next ->
        val proxied = ServerRequest.from(request).apply {
            headers { headers ->
                headers.stripIdentity()
                (SecurityContextHolder.getContext().authentication?.principal as? IdentityPrincipal)?.let {
                    headers.setBearerAuth(jwt.create(it, audience))
                }
            }
        }.build()
        next.handle(proxied)
    }

private fun HttpHeaders.stripIdentity() {
    remove(HttpHeaders.AUTHORIZATION)
    identityHeaders.forEach(::remove)
}
