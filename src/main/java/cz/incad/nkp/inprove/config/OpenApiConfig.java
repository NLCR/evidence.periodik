package cz.incad.nkp.inprove.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@SecurityScheme(
        name = "BasicAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "basic")
@OpenAPIDefinition(
        info = @Info(
                title = "Permonik REST API",
                description = "Documentation of Spring REST API for permonik web application",
                version = "1"),
        security = @SecurityRequirement(name = "BasicAuth"))
public class OpenApiConfig {
}

