package cz.incad.nkp.inprove.permonikidentitygateway.gateway

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties("gateway")
data class GatewayProperties(
    val coreUrl: String,
    val exportUrl: String,
)

@ConfigurationProperties("identity.web")
data class WebProperties(
    val adminUrl: String,
    val publicUrl: String,
    val adminHosts: List<String>,
    val publicHosts: List<String>,
)
