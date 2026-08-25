package cz.incad.nkp.inprove.permonikidentitygateway.security;

import java.nio.charset.StandardCharsets;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("identity.jwt")
public record JwtProperties(String secret) {
    public JwtProperties {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("identity.jwt.secret must contain at least 32 UTF-8 bytes");
        }
    }

    byte[] secretBytes() {
        return secret.getBytes(StandardCharsets.UTF_8);
    }
}
