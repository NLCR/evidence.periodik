package cz.incad.nkp.inprove.permonikapi.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.sun.net.httpserver.HttpServer;
import java.io.ByteArrayOutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.request.SolrQuery;
import org.apache.solr.common.SolrDocumentList;
import org.apache.solr.common.util.JavaBinCodec;
import org.apache.solr.common.util.NamedList;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class SolrConfigTest {

    @Test
    void boundCredentialsAuthenticateQueriesAndUpdates() throws Exception {
        String username = "test-account";
        String password = UUID.randomUUID().toString();
        String authorization =
                "Basic "
                        + Base64.getEncoder()
                                .encodeToString(
                                        (username + ":" + password)
                                                .getBytes(StandardCharsets.UTF_8));
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext(
                "/solr",
                exchange -> {
                    boolean authenticated =
                            authorization.equals(
                                    exchange.getRequestHeaders().getFirst("Authorization"));
                    if (!authenticated) {
                        exchange.sendResponseHeaders(401, -1);
                        exchange.close();
                        return;
                    }
                    NamedList<Object> response = new NamedList<>();
                    response.add("responseHeader", new NamedList<>(Map.of("status", 0)));
                    response.add("response", new SolrDocumentList());
                    byte[] body;
                    try (var bytes = new ByteArrayOutputStream();
                            var codec = new JavaBinCodec()) {
                        codec.marshal(response, bytes);
                        body = bytes.toByteArray();
                    }
                    exchange.getResponseHeaders()
                            .set("Content-Type", "application/vnd.apache.solr.javabin");
                    exchange.sendResponseHeaders(200, body.length);
                    try (var output = exchange.getResponseBody()) {
                        output.write(body);
                    }
                });
        server.start();
        try {
            new ApplicationContextRunner()
                    .withUserConfiguration(SolrConfig.class)
                    .withPropertyValues(
                            "solr.host=http://127.0.0.1:" + server.getAddress().getPort() + "/solr",
                            "solr.username=" + username,
                            "solr.password=" + password)
                    .run(
                            context -> {
                                assertThat(context).hasNotFailed();
                                SolrClient client = context.getBean(SolrClient.class);
                                assertThat(
                                                client.query("volume", new SolrQuery("*:*"))
                                                        .getResults())
                                        .isEmpty();
                                assertThat(client.commit("volume").getStatus()).isZero();
                            });
        } finally {
            server.stop(0);
        }
    }
}
