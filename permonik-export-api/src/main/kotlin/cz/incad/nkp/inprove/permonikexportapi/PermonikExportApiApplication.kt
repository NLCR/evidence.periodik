package cz.incad.nkp.inprove.permonikexportapi

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication

@SpringBootApplication @ConfigurationPropertiesScan class PermonikExportApiApplication

/** Starts the PerMonik export API Spring Boot application. */
fun main(args: Array<String>) {
    runApplication<PermonikExportApiApplication>(*args)
}
