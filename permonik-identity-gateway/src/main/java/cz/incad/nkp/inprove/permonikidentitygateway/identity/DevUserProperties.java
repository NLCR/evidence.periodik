package cz.incad.nkp.inprove.permonikidentitygateway.identity;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("identity.dev-user")
public record DevUserProperties(String username, String password, String email) {}
