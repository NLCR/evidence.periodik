package cz.incad.nkp.inprove.permonikidentitygateway.identity

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Profile

@Profile("dev")
@ConfigurationProperties("identity.dev-user")
class DevUserProperties(val username: String, val password: String, val email: String)
