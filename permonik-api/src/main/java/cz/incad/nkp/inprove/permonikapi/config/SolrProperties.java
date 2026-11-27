package cz.incad.nkp.inprove.permonikapi.config;

import lombok.Getter;
import org.jspecify.annotations.Nullable;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@ConfigurationProperties("solr")
public class SolrProperties {

    private final String host;
    private final @Nullable String username;
    private final @Nullable String password;

    public SolrProperties(String host, @Nullable String username, @Nullable String password) {
        if (host == null || host.isBlank()) {
            throw new IllegalArgumentException("solr.host is required");
        }
        boolean hasUsername = username != null && !username.isBlank();
        boolean hasPassword = password != null && !password.isEmpty();
        if (hasUsername != hasPassword) {
            throw new IllegalArgumentException(
                    "solr.username and solr.password must be configured together");
        }
        this.host = host;
        this.username = username;
        this.password = password;
    }
}
