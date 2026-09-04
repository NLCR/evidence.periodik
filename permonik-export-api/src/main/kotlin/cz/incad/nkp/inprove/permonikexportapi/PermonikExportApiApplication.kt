package cz.incad.nkp.inprove.permonikexportapi

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication

@SpringBootApplication
@ConfigurationPropertiesScan
class PermonikExportApiApplication

fun main(args: Array<String>) {
    runApplication<PermonikExportApiApplication>(*args)
}
