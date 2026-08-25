package cz.incad.nkp.inprove.permonikidentitygateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class PermonikIdentityGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(PermonikIdentityGatewayApplication.class, args);
    }
}
