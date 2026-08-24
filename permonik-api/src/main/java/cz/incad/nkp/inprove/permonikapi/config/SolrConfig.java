package cz.incad.nkp.inprove.permonikapi.config;

import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.impl.HttpJdkSolrClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class SolrConfig {

    @Bean
    public SolrClient solrClient(@Value("${solr.host}") String solrHost) {
        return new HttpJdkSolrClient.Builder(solrHost).build();
    }
}
