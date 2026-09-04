package cz.incad.nkp.inprove.permonikidentitygateway.identity

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties("identity.dev-user")
class DevUserProperties(val username: String, val password: String, val email: String)
