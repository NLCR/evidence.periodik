package cz.incad.nkp.inprove.permonikidentitygateway

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication

@SpringBootApplication
@ConfigurationPropertiesScan
class PermonikIdentityGatewayApplication

fun main(args: Array<String>) {
    runApplication<PermonikIdentityGatewayApplication>(*args)
}
