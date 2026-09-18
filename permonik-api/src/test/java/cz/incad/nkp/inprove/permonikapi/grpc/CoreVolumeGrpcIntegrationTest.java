package cz.incad.nkp.inprove.permonikapi.grpc;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.*;
import cz.incad.nkp.inprove.permonikapi.common.ReferenceDataService;
import cz.incad.nkp.inprove.permonikapi.config.ProfileManager;
import cz.incad.nkp.inprove.permonikapi.config.security.InternalJwtAuthenticationConverter;
import cz.incad.nkp.inprove.permonikapi.config.security.auth.PermSecurityConfiguration;
import cz.incad.nkp.inprove.permonikapi.config.security.OwnerAuthorizationService;
import cz.incad.nkp.inprove.permonikapi.specimen.SpecimenService;
import cz.incad.nkp.inprove.permonikapi.specimen.model.Specimen;
import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenMapper;
import cz.incad.nkp.inprove.permonikapi.volume.mapper.PeriodicityMapper;
import cz.incad.nkp.inprove.permonikapi.volume.model.Volume;
import cz.incad.nkp.inprove.permonikcorecontract.v1.*;
import cz.incad.nkp.inprove.permonikexportapi.core.*;
import io.grpc.*;
import io.grpc.stub.MetadataUtils;
import java.io.IOException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.request.SolrQuery;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.client.solrj.util.ClientUtils;
import org.apache.solr.common.SolrDocumentList;
import org.apache.solr.common.util.NamedList;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.grpc.client.GrpcChannelFactory;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidationException;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import cz.incad.nkp.inprove.permonikexportapi.calculation.SpecimenMatchingRules;
import cz.incad.nkp.inprove.permonikcorecontract.v1.GrpcPageRequest;
import org.springframework.boot.test.context.TestComponent;
import cz.incad.nkp.inprove.permonikcorecontract.v1.GrpcPeriodicityItem;
import java.util.ArrayList;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = CoreVolumeGrpcIntegrationTest.Application.class,
        webEnvironment = SpringBootTest.WebEnvironment.MOCK,
        properties = {"spring.grpc.server.port=0", "spring.grpc.server.address=127.0.0.1",
                "permonik.core-export.grpc.max-response-bytes=131072", "permonik.core-export.grpc.deadline=2s",
                "spring.grpc.client.channel.core.ssl.enabled=false",
                "spring.grpc.client.channel.core.inbound.message.max-size=128KB"})
class CoreVolumeGrpcIntegrationTest {
    private static final String TOKEN = randomToken();
    private static final String JWT_SECRET = randomToken();
    private static final String NAME = "core-export-" + UUID.randomUUID();
    private static final String FIRST = " volume:\"1 ";
    private static final String SECOND = "volume:2";
    @MockitoBean SolrClient solr;
    @Autowired CoreVolumeClient client;
    @Autowired CoreExportServiceGrpc.CoreExportServiceBlockingStub authenticated;
    @Autowired GrpcChannelFactory channels;
    @Autowired WebApplicationContext webContext;
    @Autowired JwtDecoder jwtDecoder;
    @Autowired List<org.springframework.grpc.server.lifecycle.GrpcServerLifecycle> servers;
    private Volume first;
    private Volume second;
    private List<Specimen> stored;

    /** Supplies ephemeral test credentials/targets without loading local environment files. */
    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("permonik.core-export.grpc.token", () -> TOKEN);
        registry.add("permonik.security.internal-jwt.secret", () -> JWT_SECRET);
        registry.add("permonik.core-export.grpc.target", () -> "in-process:" + NAME);
        registry.add("spring.grpc.client.channel.core.target", () -> "in-process:" + NAME);
        registry.add("spring.grpc.server.inprocess.name", () -> NAME);
    }

    /** Builds schema-valid stored records with optional text absent and complete cursor reads. */
    @BeforeEach
    void sourceData() throws Exception {
        first = volume(FIRST);
        first.setOwnerId("deleted-owner");
        first.setOwnerName("Stored owner label");
        first.setPeriodicity("[]");
        first.setMutationMarkType("historical-type");
        first.setDateFrom(Date.from(Instant.ofEpochMilli(-1)));
        second = volume(SECOND);
        second.setMetaTitleId("title");
        second.setOwnerId("owner");
        second.setNote("");
        second.setYear(0);
        second.setPeriodicity("[{\"day\":\"Monday\",\"editionId\":\"f5a78ed4-e565-4833-9157-d5153435620c\",\"pagesCount\":0,\"numExists\":false,\"isAttachment\":false,\"name\":\"\",\"subName\":\"\"}]");
        second.setDateFrom(Date.from(Instant.parse("1960-06-01T23:30:00.123Z")));
        second.setCreated(Date.from(Instant.ofEpochMilli(-1)));
        when(solr.query(eq("volume"), any(SolrQuery.class))).thenAnswer(invocation -> {
            SolrQuery query = invocation.getArgument(1);
            assertNull(query.getFields());
            assertTrue(Arrays.asList(query.getFilterQueries()).contains("-deleted:[* TO *]"));
            assertTrue(query.getFilterQueries()[0].contains("\"" + ClientUtils.escapeQueryChars(FIRST) + "\""));
            assertNotNull(Context.current().getDeadline());
            return response(Volume.class, List.of(second, first), 2, null);
        });
        stored = IntStream.range(0, 1001).mapToObj(index -> {
            Specimen specimen = specimen("s%04d".formatted(index), index == 1000 ? second : first);
            specimen.setNumExists(index > 1);
            specimen.setNumMissing(index == 2);
            specimen.setPagesCount(index == 1 ? 0 : 10);
            specimen.setMissingPages(List.of(0, 2, 2));
            specimen.setDamagedPages(List.of(-1, 3));
            specimen.setDamageTypes(index == 0 || index == 1000 ? List.of("PP", "ChCC", "legacy-code", "PP") : List.of());
            specimen.setPublicationDate(Date.from(Instant.parse("1960-06-01T23:30:00.123Z")));
            return specimen;
        }).toList();
        when(solr.query(eq("specimen"), any(SolrQuery.class))).thenAnswer(invocation -> {
            SolrQuery query = invocation.getArgument(1);
            assertNull(query.getFields());
            assertTrue(Arrays.asList(query.getFilterQueries()).contains("-deleted:[* TO *]"));
            assertFalse(Arrays.toString(query.getFilterQueries()).contains("num_exists"));
            assertEquals("id asc", query.get("sort"));
            return switch (query.get("cursorMark")) {
                case "*" -> response(Specimen.class, stored.subList(0, 1000), 1001, "page2");
                case "page2" -> response(Specimen.class, stored.subList(1000, 1001), 1001, "end");
                case "end" -> response(Specimen.class, List.of(), 1001, "end");
                default -> throw new AssertionError("Unexpected cursor");
            };
        });
    }

    /** Exercises authenticated generated calls, complete cursor reads and lossless export snapshots together. */
    @Test
    void authenticatedBatchPreservesStoredData() throws Exception {
        var result = client.batchGetVolumeContents(List.of(FIRST, SECOND));
        assertEquals(List.of(FIRST, SECOND), result.stream().map(it -> it.getId()).toList());
        var raw = result.getFirst();
        assertEquals(1000, raw.getSpecimens().size());
        assertEquals("s0999", raw.getSpecimens().getLast().getId());
        assertNull(raw.getNote());
        assertEquals(List.of(), raw.getPeriodicity());
        assertEquals(Instant.ofEpochMilli(-1), raw.getDateFrom());
        assertEquals("historical-type", raw.getMutationMark().getType());
        assertEquals("deleted-owner", raw.getOwner().getId());
        assertEquals("Stored owner label", raw.getOwner().getName());
        var unknown = raw.getSpecimens().getFirst();
        assertFalse(unknown.getNumExists());
        assertFalse(unknown.getNumMissing());
        assertFalse(unknown.isAttachment());
        assertNull(unknown.getNumber());
        assertEquals(10, unknown.getPagesCount());
        assertNull(unknown.getMutationMark().getMark());
        assertEquals("UNMARKED", unknown.getMutationMark().getType());
        assertEquals(0, raw.getSpecimens().get(1).getPagesCount());
        assertEquals(Instant.parse("1960-06-01T23:30:00.123Z"), unknown.getPublicationDate());
        assertEquals(List.of("PP", "ChCC", "legacy-code", "PP"), unknown.getDamageTypes());
        assertEquals(List.of(0, 2, 2), unknown.getMissingPages());
        assertEquals(List.of(-1, 3), unknown.getDamagedPages());
        assertEquals(false, raw.getSpecimens().get(1).getNumExists());
        assertEquals(false, raw.getSpecimens().get(1).getNumMissing());
        assertEquals(true, raw.getSpecimens().get(2).getNumExists());
        assertEquals(true, raw.getSpecimens().get(2).getNumMissing());
        var known = result.getLast();
        assertEquals("", known.getNote());
        assertEquals(0, known.getYear());
        assertEquals(1, known.getPeriodicity().size());
        assertEquals("Monday", known.getPeriodicity().getFirst().getDay());
        assertEquals(0, known.getPeriodicity().getFirst().getPagesCount());
        assertEquals(false, known.getPeriodicity().getFirst().getNumExists());
        assertFalse(known.getPeriodicity().getFirst().isAttachment());
        assertEquals("", known.getPeriodicity().getFirst().getName());
        assertEquals("SIG", known.getOwner().getSigla());
        assertEquals(Instant.ofEpochMilli(-1), known.getCreated());
        verify(solr, times(1)).query(eq("volume"), any(SolrQuery.class));
        verify(solr, never()).query(eq("owner"), any(SolrQuery.class));
        verify(solr, times(3)).query(eq("specimen"), any(SolrQuery.class));
    }

    /** Verifies stored search filters, full client pagination and rejection of mismatched continuation tokens. */
    @Test
    void replacementSearchUsesStoredFiltersAndDrainsCursorPages() throws Exception {
        first.setDateFrom(Date.from(Instant.parse("1960-06-01T23:30:00Z")));
        first.setDateTo(Date.from(Instant.parse("1960-06-30T01:00:00Z")));
        first.setMutationMark(null);
        var third = volume("volume:3");
        var searches = new ArrayList<SolrQuery>();
        doAnswer(invocation -> {
            SolrQuery query = invocation.getArgument(1);
            if (query.get("cursorMark") == null) return response(Volume.class, List.of(first), 1, null);
            searches.add(query);
            return switch (query.get("cursorMark")) {
                case "*" -> response(Volume.class, List.of(second), 2, "next-1");
                case "next-1" -> response(Volume.class, List.of(third), 2, "next-2");
                default -> response(Volume.class, List.of(), 2, "next-2");
            };
        }).when(solr).query(eq("volume"), any(SolrQuery.class));

        var rules = new SpecimenMatchingRules(true, true, true);
        assertEquals(List.of(SECOND, "volume:3"), client.searchReplacementVolumeIds(FIRST, rules));
        var query = searches.getFirst();
        var filters = Arrays.asList(query.getFilterQueries());
        assertTrue(filters.contains("metatitle_id:\"" + ClientUtils.escapeQueryChars(first.getMetaTitleId()) + "\""), filters.toString());
        assertTrue(filters.contains("-id:\"" + ClientUtils.escapeQueryChars(FIRST) + "\""), filters.toString());
        assertTrue(filters.contains("date_from:[* TO 1960-07-01T00:00:00Z}"), filters.toString());
        assertTrue(filters.contains("date_to:[1960-06-01T00:00:00Z TO *]"), filters.toString());
        assertTrue(filters.contains("owner_id:\"" + ClientUtils.escapeQueryChars(first.getOwnerId()) + "\""), filters.toString());
        assertTrue(filters.contains("mutation_id:\"" + ClientUtils.escapeQueryChars(first.getMutationId()) + "\""), filters.toString());
        assertTrue(filters.contains("mutation_mark_type:\"" + ClientUtils.escapeQueryChars(first.getMutationMarkType()) + "\""), filters.toString());
        assertTrue(filters.contains("-mutation_mark:[* TO *]"), filters.toString());
        assertEquals("id asc", query.getSortField());
        var request = SearchReplacementVolumesRequest.newBuilder().setPrimaryVolumeId(FIRST)
                .setMatchOwner(true).setMatchMutation(true).setMatchMutationalEdition(true).build();
        var page = authenticated.searchReplacementVolumes(request);
        var continuation = request.toBuilder().setPage(GrpcPageRequest
                .newBuilder().setPageSize(10).setPageToken(page.getNextPageToken())).build();
        assertStatus(Status.Code.INVALID_ARGUMENT, () -> authenticated.searchReplacementVolumes(continuation));
        var anonymous = CoreExportServiceGrpc.newBlockingStub(channels.createChannel("core"));
        assertStatus(Status.Code.UNAUTHENTICATED, () -> anonymous.searchReplacementVolumes(request));
        verify(solr, never()).query(eq("specimen"), any(SolrQuery.class));
    }

    /** Verifies planning filters, stored-year bounds and the authenticated metadata page response. */
    @Test
    void planningQueryUsesStoredFiltersAndReturnsVolumeMetadata() throws Exception {
        first.setMetaTitleId("title");
        first.setYear(1960);
        second.setYear(1961);
        var searches = new ArrayList<SolrQuery>();
        doAnswer(invocation -> {
            SolrQuery query = invocation.getArgument(1);
            searches.add(query);
            return response(Volume.class, List.of(first, second), 2, "*");
        }).when(solr).query(eq("volume"), any(SolrQuery.class));

        var request = QueryPlanningVolumesRequest.newBuilder()
                .setMetaTitleId("title")
                .setYearFrom(1960)
                .setYearTo(1965)
                .setMutationalEdition(GrpcMutationalEditionFilter.newBuilder().setType("UNMARKED"))
                .build();
        var page = authenticated.queryPlanningVolumes(request);

        assertEquals(List.of(FIRST, SECOND), page.getVolumesList().stream().map(GrpcVolume::getId).toList());
        var filters = Arrays.asList(searches.getFirst().getFilterQueries());
        assertTrue(filters.contains("metatitle_id:\"title\""), filters.toString());
        assertTrue(filters.contains("year:[1960 TO 1965]"), filters.toString());
        assertTrue(filters.contains("mutation_mark_type:\"UNMARKED\""), filters.toString());
        assertTrue(filters.contains("-mutation_mark:[* TO *]"), filters.toString());
        assertEquals("id asc", searches.getFirst().getSortField());
    }

    /** Proves that missing/wrong credentials and browser JWTs cannot reach data, and other RPCs fail closed. */
    @Test
    void authenticationAndMethodAllowlistProtectTheActualServer() throws Exception {
        var request = BatchGetVolumeContentsRequest.newBuilder().addVolumeIds(FIRST).build();
        var plain = CoreExportServiceGrpc.newBlockingStub(channels.createChannel("core"));
        assertStatus(Status.Code.UNAUTHENTICATED, () -> plain.batchGetVolumeContents(request));
        for (String credential : List.of("", "Bearer ", "Basic " + TOKEN, "Bearer " + randomToken(), "Bearer " + browserJwt("permonik-core"),
                "Bearer " + browserJwt("permonik-export"))) {
            var headers = new Metadata();
            headers.put(Metadata.Key.of("authorization", Metadata.ASCII_STRING_MARSHALLER), credential);
            var unauthorized = plain.withInterceptors(MetadataUtils.newAttachHeadersInterceptor(headers));
            assertStatus(Status.Code.UNAUTHENTICATED, () -> unauthorized.batchGetVolumeContents(request));
        }
        assertStatus(Status.Code.INVALID_ARGUMENT, () -> authenticated.searchReplacementVolumes(
                SearchReplacementVolumesRequest.getDefaultInstance()));
        assertStatus(Status.Code.INVALID_ARGUMENT, () -> authenticated.queryPlanningVolumes(
                QueryPlanningVolumesRequest.getDefaultInstance()));
        verifyNoInteractions(solr);
    }

    /** The real HTTP resource server keeps validating gateway JWTs independently of service credentials. */
    @Test
    void httpJwtSecurityRemainsConfigured() throws Exception {
        var mvc = MockMvcBuilders.webAppContextSetup(webContext).apply(springSecurity()).build();
        var jwt = browserJwt("permonik-core");
        assertEquals("user", jwtDecoder.decode(jwt).getSubject());
        assertThrows(JwtValidationException.class,
                () -> jwtDecoder.decode(browserJwt("permonik-export")));
        mvc.perform(put("/api/volume/test"))
                .andExpect(status().isUnauthorized());
        mvc.perform(put("/api/volume/test")
                        .header("Authorization", "Bearer " + TOKEN))
                .andExpect(status().isUnauthorized());
        mvc.perform(put("/api/volume/test")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isForbidden());
    }

    /** Verifies the production Netty transport also applies global authentication and protobuf serialization. */
    @Test
    void loopbackTransportUsesTheSameSecurityBoundary() {
        int port = servers.stream().mapToInt(it -> it.getPort()).filter(it -> it > 0).findFirst().orElseThrow();
        String target = "static://127.0.0.1:" + port;
        new org.springframework.boot.test.context.runner.ApplicationContextRunner()
                .withConfiguration(org.springframework.boot.autoconfigure.AutoConfigurations.of(
                        org.springframework.boot.autoconfigure.ssl.SslAutoConfiguration.class,
                        org.springframework.boot.grpc.client.autoconfigure.GrpcClientAutoConfiguration.class))
                .withUserConfiguration(CoreVolumeClientConfiguration.class, CoreVolumeClient.class)
                .withBean(CoreExportClientProperties.class,
                        () -> new CoreExportClientProperties(TOKEN, target, Duration.ofSeconds(2)))
                .withPropertyValues("spring.grpc.client.inprocess.enabled=false",
                        "spring.grpc.client.channel.core.target=" + target,
                        "spring.grpc.client.channel.core.ssl.enabled=false")
                .run(context -> {
                    var channel = context.getBean(GrpcChannelFactory.class).createChannel("core");
                    var plain = CoreExportServiceGrpc.newBlockingStub(channel).withDeadlineAfter(2, TimeUnit.SECONDS);
                    var request = BatchGetVolumeContentsRequest.newBuilder().addVolumeIds(FIRST).addVolumeIds(SECOND).build();
                    assertStatus(Status.Code.UNAUTHENTICATED, () -> plain.batchGetVolumeContents(request));
                    assertEquals(1000, context.getBean(CoreVolumeClient.class).batchGetVolumeContents(List.of(FIRST, SECOND))
                            .getFirst().getSpecimens().size());
                });
    }

    /** Verifies all-or-nothing failures, size limits and deadline/status propagation through the real adapter. */
    @Test
    void invalidMissingIncompleteOversizedAndUnavailableDataNeverBecomePartialSuccess() throws Exception {
        assertStatus(Status.Code.INVALID_ARGUMENT, () -> authenticated.batchGetVolumeContents(
                BatchGetVolumeContentsRequest.getDefaultInstance()));
        assertStatus(Status.Code.INVALID_ARGUMENT, () -> authenticated.batchGetVolumeContents(
                BatchGetVolumeContentsRequest.newBuilder().addVolumeIds(FIRST).addVolumeIds(FIRST).build()));
        assertStatus(Status.Code.INVALID_ARGUMENT, () -> authenticated.batchGetVolumeContents(
                BatchGetVolumeContentsRequest.newBuilder().addVolumeIds(" ").build()));
        assertStatus(Status.Code.INVALID_ARGUMENT, () -> authenticated.batchGetVolumeContents(
                BatchGetVolumeContentsRequest.newBuilder().addAllVolumeIds(
                        IntStream.range(0, 21).mapToObj(Integer::toString).toList()).build()));
        verifyNoInteractions(solr);
        assertStatus(Status.Code.NOT_FOUND, () -> client.batchGetVolumeContents(List.of(FIRST, "missing")));
        first.setNote("x".repeat(131072));
        assertStatus(Status.Code.RESOURCE_EXHAUSTED, () -> client.batchGetVolumeContents(List.of(FIRST, SECOND)));
        first.setNote(null);
        first.setPeriodicity("broken json");
        assertStatus(Status.Code.INTERNAL, () -> client.batchGetVolumeContents(List.of(FIRST, SECOND)));
        first.setPeriodicity("[]");
        var duplicate = specimen("duplicate", first);
        doReturn(response(Specimen.class, List.of(duplicate, duplicate), 2, "*"))
                .when(solr).query(eq("specimen"), any(SolrQuery.class));
        assertStatus(Status.Code.DATA_LOSS, () -> client.batchGetVolumeContents(List.of(FIRST, SECOND)));
        doReturn(response(Specimen.class, List.of(), 1, "*")).when(solr).query(eq("specimen"), any(SolrQuery.class));
        assertStatus(Status.Code.UNAVAILABLE, () -> client.batchGetVolumeContents(List.of(FIRST, SECOND)));
        doThrow(new IOException("offline")).when(solr).query(eq("volume"), any(SolrQuery.class));
        assertStatus(Status.Code.UNAVAILABLE, () -> client.batchGetVolumeContents(List.of(FIRST, SECOND)));
        CountDownLatch finished = new CountDownLatch(1);
        doAnswer(invocation -> {
            try { Thread.sleep(150); return response(Volume.class, List.of(), 0, null); }
            finally { finished.countDown(); }
        }).when(solr).query(eq("volume"), any(SolrQuery.class));
        var impatient = new CoreVolumeClient(authenticated,
                new CoreExportClientProperties(TOKEN, "in-process:" + NAME, Duration.ofMillis(30)));
        assertStatus(Status.Code.DEADLINE_EXCEEDED, () -> impatient.batchGetVolumeContents(List.of(FIRST, SECOND)));
        assertTrue(finished.await(2, TimeUnit.SECONDS));
    }

    /** Rejects absent required stored fields while keeping explicit zero and false valid. */
    @Test
    void missingRequiredSourceFieldsFailClearly() {
        first.setPeriodicity("[{\"pagesCount\":0,\"numExists\":false}]");
        var periodicityFailure = assertThrows(StatusRuntimeException.class,
                () -> client.batchGetVolumeContents(List.of(FIRST, SECOND)));
        assertEquals(Status.Code.DATA_LOSS, periodicityFailure.getStatus().getCode());
        assertEquals("Missing required Solr field: volume.periodicity.day", periodicityFailure.getStatus().getDescription());
        first.setPeriodicity("[]");
        first.setDateTo(null);
        var failure = assertThrows(StatusRuntimeException.class,
                () -> client.batchGetVolumeContents(List.of(FIRST, SECOND)));
        assertEquals(Status.Code.DATA_LOSS, failure.getStatus().getCode());
        assertEquals("Missing required Solr field: volume.date_to", failure.getStatus().getDescription());
        first.setDateTo(second.getDateTo());
        stored.getFirst().setPagesCount(null);
        failure = assertThrows(StatusRuntimeException.class,
                () -> client.batchGetVolumeContents(List.of(FIRST, SECOND)));
        assertEquals(Status.Code.DATA_LOSS, failure.getStatus().getCode());
        assertEquals("Missing required Solr field: specimen.pages_count", failure.getStatus().getDescription());
        stored.getFirst().setPagesCount(0);
        stored.getFirst().setNumMissing(null);
        failure = assertThrows(StatusRuntimeException.class,
                () -> client.batchGetVolumeContents(List.of(FIRST, SECOND)));
        assertEquals(Status.Code.DATA_LOSS, failure.getStatus().getCode());
        assertEquals("Missing required Solr field: specimen.num_missing", failure.getStatus().getDescription());
        stored.getFirst().setNumMissing(false);
        first.setMutationMarkType(null);
        failure = assertThrows(StatusRuntimeException.class,
                () -> client.batchGetVolumeContents(List.of(FIRST, SECOND)));
        assertEquals(Status.Code.DATA_LOSS, failure.getStatus().getCode());
        assertEquals("Missing required Solr field: volume.mutation_mark_type", failure.getStatus().getDescription());
    }

    /** Exercises client presence validation through generated calls to an incompatible peer. */
    @Test
    void missingRequiredWireFieldsAreDataLoss() throws Exception {
        var valid = authenticated.withDeadlineAfter(2, TimeUnit.SECONDS).batchGetVolumeContents(BatchGetVolumeContentsRequest.newBuilder()
                .addVolumeIds(FIRST).addVolumeIds(SECOND).build()).getVolumes(0).toBuilder();
        var source = valid.getSpecimens(1).toBuilder();
        valid.clearSpecimens().addSpecimens(source);
        var reply = new java.util.concurrent.atomic.AtomicReference<>(valid.build());
        String name = io.grpc.inprocess.InProcessServerBuilder.generateName();
        var server = io.grpc.inprocess.InProcessServerBuilder.forName(name).directExecutor()
                .addService(new CoreExportServiceGrpc.CoreExportServiceImplBase() {
                    @Override
                    public void batchGetVolumeContents(BatchGetVolumeContentsRequest request,
                            io.grpc.stub.StreamObserver<BatchGetVolumeContentsResponse> observer) {
                        observer.onNext(BatchGetVolumeContentsResponse.newBuilder().addVolumes(reply.get()).build());
                        observer.onCompleted();
                    }
                }).build().start();
        var channel = io.grpc.inprocess.InProcessChannelBuilder.forName(name).directExecutor().build();
        try {
            var peer = new CoreVolumeClient(CoreExportServiceGrpc.newBlockingStub(channel),
                    new CoreExportClientProperties(TOKEN, "in-process:" + name, Duration.ofSeconds(2)));
            assertEquals(0, peer.batchGetVolumeContents(List.of(FIRST)).getFirst().getSpecimens().getFirst().getPagesCount());
            for (var invalid : List.of(
                    valid.clone().setSpecimens(0, source.clone().clearPagesCount()).build(),
                    valid.clone().setSpecimens(0, source.clone().clearNumMissing()).build(),
                    valid.clone().setVolume(valid.getVolume().toBuilder().clearDateFrom()).build(),
                    valid.clone().setVolume(valid.getVolume().toBuilder().clearPeriodicity()).build(),
                    valid.clone().setVolume(valid.getVolume().toBuilder().setPeriodicity(
                            valid.getVolume().getPeriodicity().toBuilder().addItems(GrpcPeriodicityItem.getDefaultInstance()))).build(),
                    valid.clone().setVolume(valid.getVolume().toBuilder().setOwner(
                            valid.getVolume().getOwner().toBuilder().clearName())).build(),
                    valid.clone().setSpecimens(0, source.clone().setMutationMark(
                            source.getMutationMark().toBuilder().clearType())).build())) {
                reply.set(invalid);
                assertStatus(Status.Code.DATA_LOSS, () -> peer.batchGetVolumeContents(List.of(FIRST)));
            }
        } finally {
            channel.shutdownNow().awaitTermination(2, TimeUnit.SECONDS);
            server.shutdownNow().awaitTermination(2, TimeUnit.SECONDS);
        }
    }

    /** Supplies every required stored volume field without inventing optional values. */
    private static Volume volume(String id) {
        var volume = new Volume();
        volume.setId(id);
        volume.setBarCode("barcode");
        volume.setDateFrom(Date.from(Instant.parse("1960-01-01T00:00:00Z")));
        volume.setDateTo(Date.from(Instant.parse("1970-12-31T00:00:00Z")));
        volume.setMetaTitleId("title");
        volume.setMetaTitleName("Title");
        volume.setMutationId("mutation");
        volume.setMutationCsName("CS");
        volume.setMutationSkName("SK");
        volume.setMutationEnName("EN");
        volume.setMutationMarkType("UNMARKED");
        volume.setOwnerId("owner");
        volume.setOwnerName("Stored owner");
        volume.setOwnerShorthand("SO");
        volume.setOwnerSigla("SIG");
        volume.setPeriodicity("[]");
        volume.setFirstNumber(1);
        volume.setLastNumber(365);
        volume.setYear(1960);
        volume.setAttachmentsSort("NONE");
        volume.setCreated(Date.from(Instant.EPOCH));
        volume.setCreatedBy("creator");
        return volume;
    }

    /** Supplies every required stored specimen field, including denormalized references. */
    private static Specimen specimen(String id, Volume volume) {
        var specimen = new Specimen();
        specimen.setId(id);
        specimen.setVolumeId(volume.getId());
        specimen.setBarCode(volume.getBarCode());
        specimen.setMetaTitleId(volume.getMetaTitleId());
        specimen.setMetaTitleName(volume.getMetaTitleName());
        specimen.setOwnerId(volume.getOwnerId());
        specimen.setOwnerName(volume.getOwnerName());
        specimen.setOwnerShorthand(volume.getOwnerShorthand());
        specimen.setOwnerSigla(volume.getOwnerSigla());
        specimen.setEditionId("edition");
        specimen.setEditionCsName("CS");
        specimen.setEditionSkName("SK");
        specimen.setEditionEnName("EN");
        specimen.setMutationId(volume.getMutationId());
        specimen.setMutationCsName(volume.getMutationCsName());
        specimen.setMutationSkName(volume.getMutationSkName());
        specimen.setMutationEnName(volume.getMutationEnName());
        specimen.setMutationMarkType("UNMARKED");
        specimen.setPublicationDate(volume.getDateFrom());
        specimen.setIsAttachment(false);
        specimen.setNumExists(true);
        specimen.setNumMissing(false);
        specimen.setPagesCount(10);
        specimen.setCreated(volume.getCreated());
        specimen.setCreatedBy(volume.getCreatedBy());
        return specimen;
    }

    /** Creates Solr boundary responses while leaving all query and projection services real. */
    private static <T> QueryResponse response(Class<T> type, List<T> values, long count, String cursor) {
        QueryResponse response = mock(QueryResponse.class);
        when(response.getBeans(type)).thenReturn(values);
        SolrDocumentList documents = new SolrDocumentList();
        documents.setNumFound(count);
        when(response.getResults()).thenReturn(documents);
        when(response.getHeader()).thenReturn(new NamedList<>());
        when(response.getNextCursorMark()).thenReturn(cursor);
        return response;
    }

    /** Asserts native gRPC failure codes without depending on implementation exception text. */
    private static void assertStatus(Status.Code code, org.junit.jupiter.api.function.Executable call) {
        assertEquals(code, assertThrows(StatusRuntimeException.class, call).getStatus().getCode());
    }

    /** Produces ephemeral test credentials, never deployment credentials. */
    private static String randomToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    /** Models a signed gateway user token, which is not a trusted service credential. */
    private static String browserJwt(String audience) throws JOSEException {
        var jwt = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), new JWTClaimsSet.Builder()
                .issuer("permonik-identity-gateway").subject("user").audience(audience)
                .expirationTime(Date.from(Instant.now().plusSeconds(60))).claim("authorities", List.of("TEMPLATE_MANAGE"))
                .claim("username", "test-user").claim("role", "digitalization")
                .build());
        jwt.sign(new MACSigner(JWT_SECRET));
        return jwt.serialize();
    }

    @Configuration(proxyBeanMethods = false)
    @TestComponent
    @EnableAutoConfiguration
    @EnableConfigurationProperties(CoreExportClientProperties.class)
    @Import({CoreExportSecurityConfiguration.class, CoreExportGrpcService.class,
            PermSecurityConfiguration.class, ProfileManager.class, InternalJwtAuthenticationConverter.class,
            ReferenceDataService.class, PeriodicityMapper.class, CoreVolumeClient.class, CoreVolumeClientConfiguration.class})
    static class Application {
        /** Boot 4.1.1 configures named targets for Netty but not its in-process test factory. */
        @Bean org.springframework.boot.grpc.client.autoconfigure.GrpcChannelFactoryCustomizer inProcessTarget() {
            return factory -> {
                if (factory instanceof org.springframework.grpc.client.InProcessGrpcChannelFactory inProcess) {
                    inProcess.setVirtualTargets(name -> name.equals("core") ? "in-process:" + NAME : name);
                }
            };
        }
        /** Supplies real cursor queries rather than mocking the service under test. */
        @Bean SpecimenService specimenService(SolrClient solr, ObjectMapper mapper, ReferenceDataService references) {
            return new SpecimenService(solr, mock(SpecimenMapper.class), mapper, references, mock(OwnerAuthorizationService.class));
        }
        /** Uses the same Jackson generation as production for stored periodicity parsing. */
        @Bean ObjectMapper objectMapper() { return JsonMapper.builder().build(); }
    }
}
