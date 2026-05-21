package cz.incad.nkp.inprove.permonikapi;

import com.redis.testcontainers.RedisContainer;
import org.apache.solr.client.solrj.impl.HttpJdkSolrClient;
import org.apache.solr.client.solrj.request.CollectionAdminRequest;
import org.apache.solr.client.solrj.request.ConfigSetAdminRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.lifecycle.Startables;
import org.testcontainers.solr.SolrContainer;
import org.testcontainers.utility.DockerImageName;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class AbstractSolrIntegrationTest {

    // analysis-extras module enables ICUCollationField (icu_cs_sort) used in production schemas
    static final SolrContainer SOLR = new SolrContainer(DockerImageName.parse("solr:10.0.0"))
        .withEnv("SOLR_MODULES", "analysis-extras");
    static final RedisContainer REDIS = new RedisContainer(DockerImageName.parse("redis:8.6-alpine"))
        .withExposedPorts(6379);
    private static final Logger log = LoggerFactory.getLogger(AbstractSolrIntegrationTest.class);
    private static final List<String> CORES =
        List.of("owner", "edition", "mutation", "metatitle", "user", "volume", "specimen");

    static {
        Startables.deepStart(SOLR, REDIS).join();
        setupCores();
    }

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("solr.host", () -> "http://" + SOLR.getHost() + ":" + SOLR.getSolrPort() + "/solr");
        registry.add("spring.data.redis.host", REDIS::getHost);
        registry.add("spring.data.redis.port", () -> REDIS.getMappedPort(6379));
    }

    private static void setupCores() {
        // permonik-database/cores is a sibling of this module's directory
        Path coresBase = Path.of(System.getProperty("user.dir"))
            .getParent()
            .resolve("permonik-database/cores");

        String solrUrl = "http://" + SOLR.getHost() + ":" + SOLR.getSolrPort() + "/solr";
        log.info("Initializing Solr collections from {}", coresBase);
        try (var client = new HttpJdkSolrClient.Builder(solrUrl).build()) {
            for (String core : CORES) {
                Path confDir = coresBase.resolve(core + "/conf");
                Path zipFile = zipConfDir(confDir, core);
                try {
                    uploadConfigSet(client, zipFile, core);
                    CollectionAdminRequest.createCollection(core, core, 1, 1).process(client);
                    logSchemaFields(confDir, core);
                } finally {
                    Files.deleteIfExists(zipFile);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to setup Solr cores", e);
        }
    }

    private static Path zipConfDir(Path confDir, String coreName) throws IOException {
        Path zipFile = Files.createTempFile("solr-config-" + coreName, ".zip");
        try (var zos = new ZipOutputStream(Files.newOutputStream(zipFile));
             var paths = Files.walk(confDir)) {
            paths.filter(p -> !Files.isDirectory(p)).forEach(file -> {
                String entryName = confDir.relativize(file).toString();
                try {
                    zos.putNextEntry(new ZipEntry(entryName));
                    Files.copy(file, zos);
                    zos.closeEntry();
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            });
        }
        return zipFile;
    }

    private static void uploadConfigSet(HttpJdkSolrClient client, Path zipFile, String configSetName) throws Exception {
        var upload = new ConfigSetAdminRequest.Upload();
        upload.setConfigSetName(configSetName);
        upload.setUploadFile(zipFile, "application/zip");
        upload.process(client);
    }

    private static void logSchemaFields(Path confDir, String core) {
        Path schemaFile = confDir.resolve("managed-schema.xml");
        try {
            var doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(schemaFile.toFile());
            NodeList fields = doc.getElementsByTagName("field");
            List<String> fieldSummaries = new ArrayList<>();
            for (int i = 0; i < fields.getLength(); i++) {
                Element el = (Element) fields.item(i);
                fieldSummaries.add(el.getAttribute("name") + ":" + el.getAttribute("type"));
            }
            log.info("Solr core '{}' initialized with {} fields: {}", core, fieldSummaries.size(), fieldSummaries);
        } catch (Exception e) {
            log.warn("Could not parse schema for core '{}'", core, e);
        }
    }
}
