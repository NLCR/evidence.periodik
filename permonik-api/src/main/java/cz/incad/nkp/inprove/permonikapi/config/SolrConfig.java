package cz.incad.nkp.inprove.permonikapi.config;

import lombok.RequiredArgsConstructor;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.impl.HttpJdkSolrClient;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@EnableConfigurationProperties(SolrProperties.class)
public class SolrConfig {

    private final SolrProperties properties;

    @Bean
    public SolrClient solrClient() {
        var builder = new HttpJdkSolrClient.Builder(properties.getHost());
        String username = properties.getUsername();
        String password = properties.getPassword();
        if (username != null && !username.isBlank() && password != null) {
            builder.withBasicAuthCredentials(username, password);
        }
        return builder.build();
    }
}
