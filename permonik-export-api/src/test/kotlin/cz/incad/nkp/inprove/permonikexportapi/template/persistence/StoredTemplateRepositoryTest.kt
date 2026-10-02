package cz.incad.nkp.inprove.permonikexportapi.template.persistence

import cz.incad.nkp.inprove.permonikexportapi.template.InvalidTemplateException
import cz.incad.nkp.inprove.permonikexportapi.template.MainReplacement
import cz.incad.nkp.inprove.permonikexportapi.template.MutationMark
import cz.incad.nkp.inprove.permonikexportapi.template.MutationMarkType
import cz.incad.nkp.inprove.permonikexportapi.template.PrimaryMainScan
import cz.incad.nkp.inprove.permonikexportapi.template.Replacement
import cz.incad.nkp.inprove.permonikexportapi.template.ReplacementMainScan
import cz.incad.nkp.inprove.permonikexportapi.template.ReplacementSource
import cz.incad.nkp.inprove.permonikexportapi.template.ReplacementSourcesParameters
import cz.incad.nkp.inprove.permonikexportapi.template.ReplacementStatus
import cz.incad.nkp.inprove.permonikexportapi.template.StateConflictException
import cz.incad.nkp.inprove.permonikexportapi.template.Template
import cz.incad.nkp.inprove.permonikexportapi.template.TemplateIssues
import cz.incad.nkp.inprove.permonikexportapi.template.TemplateItem
import cz.incad.nkp.inprove.permonikexportapi.template.TemplateSpecimen
import cz.incad.nkp.inprove.permonikexportapi.template.TemplateState
import cz.incad.nkp.inprove.permonikexportapi.template.TemplateTransition
import cz.incad.nkp.inprove.permonikexportapi.template.TemplateValidationException
import cz.incad.nkp.inprove.permonikexportapi.template.TemplateWorkflowService
import cz.incad.nkp.inprove.permonikexportapi.template.VersionConflictException
import cz.incad.nkp.inprove.permonikexportapi.template.Volume
import cz.incad.nkp.inprove.permonikexportapi.template.VolumeAttachmentsSort
import cz.incad.nkp.inprove.permonikexportapi.template.VolumePeriodicity
import cz.incad.nkp.inprove.permonikexportapi.template.VolumePeriodicityDay
import java.time.Instant
import java.util.UUID
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.dao.OptimisticLockingFailureException
import org.springframework.data.jdbc.repository.config.EnableJdbcRepositories
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.transaction.PlatformTransactionManager
import org.springframework.transaction.support.TransactionTemplate
import org.testcontainers.postgresql.PostgreSQLContainer
import tools.jackson.databind.exc.MismatchedInputException
import tools.jackson.databind.json.JsonMapper
import tools.jackson.databind.node.ObjectNode

@SpringBootTest(
    classes = [StoredTemplateRepositoryTest.DatabaseConfiguration::class],
    webEnvironment = SpringBootTest.WebEnvironment.NONE,
)
class StoredTemplateRepositoryTest
@Autowired
constructor(
    private val templates: StoredTemplateRepository,
    private val jdbc: JdbcClient,
    private val transactions: PlatformTransactionManager,
    private val mapper: JsonMapper,
    private val workflow: TemplateWorkflowService,
) {
    @Configuration(proxyBeanMethods = false)
    @EnableAutoConfiguration
    @EnableJdbcRepositories(basePackageClasses = [StoredTemplateRepository::class])
    @Import(
        TemplateJdbcConfiguration::class,
        TemplateAuditingConfiguration::class,
        TemplateWorkflowService::class,
    )
    class DatabaseConfiguration

    /**
     * Supplies the identity that the resource-server filter normally establishes before a template
     * write.
     */
    @BeforeEach fun authenticateEditor() = authenticate("editor")

    /** Prevents the current test's identity from leaking into another operation. */
    @AfterEach fun clearAuthentication() = SecurityContextHolder.clearContext()

    /**
     * Models a verified JWT principal without involving the unrelated gateway login or token
     * issuance.
     */
    private fun authenticate(subject: String) {
        val jwt = Jwt.withTokenValue("test-only").header("alg", "HS256").subject(subject).build()
        SecurityContextHolder.getContext().authentication = JwtAuthenticationToken(jwt, emptyList())
    }

    /**
     * Proves JSONB round-tripping omits preview flags, preserves decisions and guards concurrent
     * revisions.
     */
    @Test
    fun storesDecisionsWithoutPreviewStateAndRejectsStaleUpdates() {
        val saved = templates.save(template())
        assertEquals(7, requireNotNull(saved.id).version())
        val loaded = requireNotNull(templates.findActiveByVolumeId(saved.primaryVolumeId))
        assertEquals(0L, loaded.version)
        assertEquals("editor", loaded.createdBy)
        assertEquals("editor", loaded.modifiedBy)
        assertEquals("source-author", loaded.content.primaryVolume.createdBy)
        assertNull(loaded.content.primaryVolume.signature)
        assertEquals(
            VolumePeriodicityDay.MONDAY,
            loaded.content.primaryVolume.periodicity.single().day,
        )
        assertTrue(requireNotNull(loaded.createdDate) <= requireNotNull(loaded.modifiedDate))
        assertEquals(saved.id, loaded.id)
        assertTrue(loaded.content.items.all { it.mainScan.visible })
        assertTrue(loaded.content.items[0].pageReplacements.single().visible)
        assertEquals(
            saved.content.items[1].mainScan.locked,
            loaded.content.items[1].mainScan.locked,
        )
        assertEquals(saved.content.replacementSources, loaded.content.replacementSources)
        assertFalse(
            jdbc
                .sql(
                    "SELECT jsonb_path_exists(content, '$.**.visible') FROM export_template WHERE id = :id"
                )
                .param("id", saved.id)
                .query(Boolean::class.java)
                .single()
        )
        assertTrue(
            mapper
                .readTree(mapper.writeValueAsString(saved.content))
                .at("/items/0/mainScan")
                .has("visible")
        )

        val changed =
            loaded.copy(
                state = TemplateState.WAITING_FOR_RESCAN,
                content =
                    loaded.content.copy(
                        items = loaded.content.items.map { it.copy(note = "Reviewed") }
                    ),
            )
        authenticate("reviewer")
        val updated = templates.save(changed)
        assertEquals(saved.id, updated.id)
        assertEquals(requireNotNull(loaded.version) + 1, updated.version)
        assertThrows(OptimisticLockingFailureException::class.java) {
            templates.save(loaded.copy(state = TemplateState.LATE_FIXES))
        }
        val current = requireNotNull(templates.findActiveByVolumeId(saved.primaryVolumeId))
        assertEquals(TemplateState.WAITING_FOR_RESCAN, current.state)
        assertEquals("Reviewed", current.content.items.first().note)
        assertEquals("reviewer", current.modifiedBy)
        assertEquals(saved.createdBy, current.createdBy)
        assertEquals(loaded.createdDate, current.createdDate)
        assertTrue(requireNotNull(current.modifiedDate) >= requireNotNull(loaded.modifiedDate))

        assertThrows(IllegalStateException::class.java) {
            TransactionTemplate(transactions).executeWithoutResult {
                templates.save(
                    current.copy(
                        state = TemplateState.FINALIZED,
                        content = current.content.copy(items = emptyList()),
                    )
                )
                error("Abort the workflow transaction")
            }
        }
        assertEquals(current, templates.findActiveByVolumeId(saved.primaryVolumeId))
    }

    /**
     * Proves active uniqueness is enforced by PostgreSQL while soft deletion retains history and
     * permits recreation.
     */
    @Test
    fun retainsDeletedHistoryButAllowsOnlyOneActiveTemplate() {
        val original = template()
        val saved = templates.save(original)
        assertThrows(DataIntegrityViolationException::class.java) {
            templates.save(original)
        }
        val deleted =
            templates.save(
                saved.copy(
                    deletedDate = Instant.now(),
                    deletedBy = "editor",
                )
            )
        assertNull(templates.findActiveByVolumeId(saved.primaryVolumeId))
        assertTrue(templates.findById(requireNotNull(deleted.id)).isPresent)
        val recreated = templates.save(original)
        assertEquals(7, requireNotNull(recreated.id).version())
        assertFalse(saved.id == recreated.id)
        assertEquals(recreated.id, templates.findActiveByVolumeId(saved.primaryVolumeId)?.id)
        assertThrows(OptimisticLockingFailureException::class.java) { templates.save(saved) }
    }

    /**
     * Rejects unauthenticated, subject-less and service-only writes even when audit fields are
     * supplied manually.
     */
    @Test
    fun rejectsWritesWithoutUserIdentity() {
        val original =
            template()
                .copy(
                    createdDate = Instant.EPOCH,
                    createdBy = "forged",
                    modifiedDate = Instant.EPOCH,
                    modifiedBy = "forged",
                )
        SecurityContextHolder.clearContext()
        assertThrows(AuthenticationCredentialsNotFoundException::class.java) {
            templates.save(original)
        }
        SecurityContextHolder.getContext().authentication =
            UsernamePasswordAuthenticationToken.authenticated("core-export", null, emptyList())
        assertThrows(AuthenticationCredentialsNotFoundException::class.java) {
            templates.save(original)
        }
        authenticate(" ")
        assertThrows(AuthenticationCredentialsNotFoundException::class.java) {
            templates.save(original)
        }
        assertNull(templates.findActiveByVolumeId(original.primaryVolumeId))
    }

    /**
     * Requires source creation audit and stored mark type instead of accepting incomplete source
     * snapshots.
     */
    @Test
    fun rejectsMissingRequiredSourceFields() {
        val content = template().content
        val withoutAudit = mapper.readTree(mapper.writeValueAsString(content)) as ObjectNode
        (withoutAudit.get("primaryVolume") as ObjectNode).remove("created")
        assertThrows(MismatchedInputException::class.java) {
            mapper.readValue(mapper.writeValueAsString(withoutAudit), TemplateContent::class.java)
        }
        val withoutType = mapper.readTree(mapper.writeValueAsString(content)) as ObjectNode
        (withoutType.at("/items/0/specimen/mutationMark") as ObjectNode).remove("type")
        assertThrows(MismatchedInputException::class.java) {
            mapper.readValue(mapper.writeValueAsString(withoutType), TemplateContent::class.java)
        }
    }

    /**
     * Exercises closing, finalization and reopening with atomic edits, preserved source data and
     * automatic locking.
     */
    @Test
    fun storedWorkflowValidatesBeforeWritingAndLocksFinalizedAssignments() {
        val original = templates.save(template())
        val request =
            request(original)
                .copy(
                    state = TemplateState.FINALIZED,
                    primaryVolume =
                        original.content.primaryVolume.copy(signature = "Untrusted signature"),
                    primaryVolumeFillIndex = 0,
                    combinedFillIndex = 0,
                    items =
                        original.content.items.map { item ->
                            item.copy(
                                specimen = item.specimen.copy(number = "Untrusted number"),
                                mainScan =
                                    when (val scan = item.mainScan) {
                                        is PrimaryMainScan -> scan.copy(locked = false)
                                        is ReplacementMainScan -> scan.copy(locked = false)
                                    },
                                pageReplacements =
                                    item.pageReplacements.map {
                                        it.copy(
                                            status = ReplacementStatus.WAITING_FOR_RESCAN,
                                            locked = false,
                                        )
                                    },
                                note = "Draft",
                            )
                        },
                )
        val edited = workflow.save(original.primaryVolumeId, request)
        assertEquals(TemplateState.CREATED, edited.state)
        assertEquals(original.content.primaryVolume, edited.content.primaryVolume)
        assertEquals(
            original.content.items.map { it.specimen },
            edited.content.items.map { it.specimen },
        )
        assertEquals(original.content.combinedFillIndex, edited.content.combinedFillIndex)
        assertEquals(original.content.issues, edited.content.issues)
        val beforeFailedTransition =
            requireNotNull(templates.findActiveByVolumeId(original.primaryVolumeId))
        val invalidChanges =
            request(edited)
                .copy(items = edited.content.items.map { it.copy(note = "Must not be saved") })
        val failure =
            assertThrows(TemplateValidationException::class.java) {
                workflow.transition(
                    original.primaryVolumeId,
                    TemplateTransition(
                        TemplateState.FINALIZED,
                        requireNotNull(edited.version),
                        invalidChanges,
                    ),
                )
            }
        assertEquals("items[0].pageReplacements[0]", failure.violations.single().path)
        assertEquals(
            beforeFailedTransition,
            templates.findActiveByVolumeId(original.primaryVolumeId),
        )

        val waiting =
            workflow.transition(
                original.primaryVolumeId,
                TemplateTransition(
                    TemplateState.WAITING_FOR_RESCAN,
                    requireNotNull(edited.version),
                ),
            )
        assertThrows(VersionConflictException::class.java) {
            workflow.save(original.primaryVolumeId, request(edited))
        }
        assertThrows(TemplateValidationException::class.java) {
            workflow.save(
                original.primaryVolumeId,
                request(waiting)
                    .copy(
                        items =
                            waiting.content.items.map { item ->
                                item.copy(
                                    pageReplacements =
                                        item.pageReplacements.map {
                                            it.copy(status = ReplacementStatus.UNRESOLVED)
                                        }
                                )
                            }
                    ),
            )
        }
        val resolved =
            request(waiting)
                .copy(
                    items =
                        waiting.content.items.map { item ->
                            item.copy(
                                note = "Resolved",
                                pageReplacements =
                                    item.pageReplacements.map {
                                        it.copy(status = ReplacementStatus.ASSIGNED)
                                    },
                            )
                        }
                )
        authenticate("reviewer")
        val finalized =
            workflow.transition(
                original.primaryVolumeId,
                TemplateTransition(
                    TemplateState.FINALIZED,
                    requireNotNull(waiting.version),
                    resolved,
                ),
            )
        assertEquals(requireNotNull(waiting.version) + 1, finalized.version)
        assertEquals("reviewer", finalized.modifiedBy)
        assertEquals("editor", finalized.createdBy)
        assertTrue(
            finalized.content.items.all {
                it.mainScan.locked && it.pageReplacements.all { page -> page.locked }
            }
        )
        assertTrue(finalized.content.items.all { it.note == "Resolved" })
        assertThrows(StateConflictException::class.java) {
            workflow.save(original.primaryVolumeId, request(finalized))
        }
        assertThrows(StateConflictException::class.java) {
            workflow.transition(
                original.primaryVolumeId,
                TemplateTransition(TemplateState.CREATED, requireNotNull(finalized.version)),
            )
        }
        val reopened =
            workflow.transition(
                original.primaryVolumeId,
                TemplateTransition(TemplateState.LATE_FIXES, requireNotNull(finalized.version)),
            )
        assertTrue(reopened.content.items.all { it.mainScan.locked })
        val closed =
            workflow.transition(
                original.primaryVolumeId,
                TemplateTransition(TemplateState.FINALIZED, requireNotNull(reopened.version)),
            )
        assertEquals(TemplateState.FINALIZED, closed.state)
    }

    /**
     * Rejects malformed editable lists and missing assigned sources without persisting any
     * accompanying changes.
     */
    @Test
    fun storedWorkflowRejectsInvalidEdits() {
        val saved = templates.save(template())
        val submitted = request(saved)
        for (items in
            listOf(emptyList(), listOf(submitted.items.first(), submitted.items.first()))) {
            assertThrows(InvalidTemplateException::class.java) {
                workflow.save(saved.primaryVolumeId, submitted.copy(items = items))
            }
        }
        val first = submitted.items.first()
        for (pages in
            listOf(
                first.pageReplacements + first.pageReplacements,
                first.pageReplacements.map { it.copy(pages = listOf(2, 1)) },
            )) {
            assertThrows(InvalidTemplateException::class.java) {
                workflow.save(
                    saved.primaryVolumeId,
                    submitted.copy(
                        items =
                            listOf(first.copy(pageReplacements = pages)) + submitted.items.drop(1)
                    ),
                )
            }
        }
        val withoutSource =
            submitted.copy(
                items =
                    submitted.items.map { item ->
                        item.copy(
                            pageReplacements =
                                item.pageReplacements.map { it.copy(volume = ReplacementSource()) }
                        )
                    }
            )
        val failure =
            assertThrows(TemplateValidationException::class.java) {
                workflow.transition(
                    saved.primaryVolumeId,
                    TemplateTransition(
                        TemplateState.FINALIZED,
                        requireNotNull(saved.version),
                        withoutSource,
                    ),
                )
            }
        assertEquals("REPLACEMENT_SOURCE_REQUIRED", failure.violations.single().code)
        assertEquals(saved.version, templates.findActiveByVolumeId(saved.primaryVolumeId)?.version)
        val finalized =
            workflow.transition(
                saved.primaryVolumeId,
                TemplateTransition(TemplateState.FINALIZED, requireNotNull(saved.version)),
            )
        assertEquals(TemplateState.FINALIZED, finalized.state)
    }

    /**
     * Supplies a full frontend-shaped request from persisted test data without inventing audit
     * values.
     */
    private fun request(stored: StoredTemplate) =
        Template(
            id = stored.id.toString(),
            version = stored.version,
            state = stored.state,
            primaryVolume = stored.content.primaryVolume,
            replacementSourcesParameters = stored.content.replacementSourcesParameters,
            primaryVolumeFillIndex = stored.content.primaryVolumeFillIndex,
            combinedFillIndex = stored.content.combinedFillIndex,
            items = stored.content.items,
            createdDate = requireNotNull(stored.createdDate),
            modifiedDate = requireNotNull(stored.modifiedDate),
        )

    /**
     * Builds one server-owned snapshot with whole and page decisions using the existing domain
     * types.
     */
    private fun template(): StoredTemplate {
        val volumeId = UUID.randomUUID().toString()
        val source = ReplacementSource(volumeId = "replacement", priority = 1, signature = "Source")
        val specimen =
            TemplateSpecimen(
                id = "issue",
                publicationDate = "2025-01-01",
                mutationMark = MutationMark(type = MutationMarkType.UNMARKED),
                isAttachment = false,
                numExists = true,
                numMissing = false,
            )
        val volume =
            Volume(
                id = volumeId,
                barCode = "barcode",
                dateFrom = "2025-01-01",
                dateTo = "2025-12-31",
                metaTitleId = "title",
                metaTitleName = "Title",
                subName = null,
                mutationId = "mutation",
                mutationName = "Mutation",
                periodicity =
                    listOf(
                        VolumePeriodicity(
                            numExists = false,
                            isAttachment = false,
                            editionId = "f5a78ed4-e565-4833-9157-d5153435620c",
                            day = VolumePeriodicityDay.MONDAY,
                            pagesCount = 0,
                            name = "",
                            subName = "",
                        )
                    ),
                firstNumber = 1,
                lastNumber = 2,
                note = null,
                attachmentsSort = VolumeAttachmentsSort.NONE,
                signature = null,
                ownerId = "owner",
                ownerName = "Owner",
                year = 2025,
                mutationMark = MutationMark(type = MutationMarkType.UNMARKED),
                created = "2025-01-01T00:00:00Z",
                createdBy = "source-author",
            )
        val content =
            TemplateContent(
                primaryVolume = volume,
                primaryOwnerSigla = "OWNER",
                replacementSourcesParameters =
                    ReplacementSourcesParameters(
                        metatitle = true,
                        mutation = false,
                        mutationalEdition = false,
                        owner = false,
                        timeOverlap = true,
                    ),
                primaryVolumeFillIndex = 50999,
                combinedFillIndex = 100999,
                issues =
                    TemplateIssues(
                        missingPages = true,
                        damagedPages = true,
                        illegiblyBound = true,
                        missingSpecimen = true,
                        censored = true,
                        degradation = true,
                    ),
                replacementSources = listOf(source),
                items =
                    listOf(
                        TemplateItem(
                            specimen,
                            PrimaryMainScan(locked = true, visible = false),
                            listOf(
                                Replacement(
                                    volume = source,
                                    pages = listOf(1, 2),
                                    status = ReplacementStatus.ASSIGNED,
                                    locked = true,
                                    visible = false,
                                )
                            ),
                        ),
                        TemplateItem(
                            specimen.copy(id = "issue-2"),
                            ReplacementMainScan(
                                locked = true,
                                visible = false,
                                replacement =
                                    MainReplacement(source, status = ReplacementStatus.ASSIGNED),
                            ),
                            emptyList(),
                        ),
                    ),
            )
        return StoredTemplate(
            primaryVolumeId = volumeId,
            ownerId = volume.ownerId,
            state = TemplateState.CREATED,
            content = content,
        )
    }

    companion object {
        private val postgres =
            PostgreSQLContainer("postgres:18.6").withPassword(UUID.randomUUID().toString()).apply {
                start()
            }

        /**
         * Runs real Liquibase migrations against an isolated PostgreSQL, never the development
         * database.
         */
        @JvmStatic
        @DynamicPropertySource
        fun databaseProperties(registry: DynamicPropertyRegistry) {
            registry.add("spring.datasource.url", postgres::getJdbcUrl)
            registry.add("spring.datasource.username", postgres::getUsername)
            registry.add("spring.datasource.password", postgres::getPassword)
        }

        /** Releases the isolated test database without touching the Compose stack. */
        @JvmStatic @AfterAll fun stopDatabase() = postgres.stop()
    }
}
