package cz.incad.nkp.inprove.permonikexportapi.template

import cz.incad.nkp.inprove.permonikexportapi.integration.IntegrationMutationMark
import cz.incad.nkp.inprove.permonikexportapi.integration.IntegrationSpecimen
import cz.incad.nkp.inprove.permonikexportapi.integration.IntegrationTemplate
import cz.incad.nkp.inprove.permonikexportapi.integration.IntegrationTemplateService
import cz.incad.nkp.inprove.permonikexportapi.integration.IntegrationVolume
import cz.incad.nkp.inprove.permonikexportapi.planning.TemplatePlanning
import cz.incad.nkp.inprove.permonikexportapi.planning.TemplatePlanningLibrary
import cz.incad.nkp.inprove.permonikexportapi.planning.TemplatePlanningQuery
import cz.incad.nkp.inprove.permonikexportapi.planning.TemplatePlanningService
import cz.incad.nkp.inprove.permonikexportapi.planning.TemplatePlanningVolume
import cz.incad.nkp.inprove.permonikexportapi.planning.TemplatePlanningYear
import java.time.Instant
import java.time.LocalDate
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import org.springframework.stereotype.Service
import cz.incad.nkp.inprove.permonikexportapi.template.TemplateRules.validateParameters

@Service
class MockTemplateService : TemplateService, TemplatePlanningService, IntegrationTemplateService {
    private val templates = ConcurrentHashMap<String, Template>()
    private val deletedTemplates = ConcurrentHashMap<String, Template>()
    private val generationSettings = ConcurrentHashMap<String, ScanTemplateSettings>()

    /** Reads an active in-memory template or reports that the volume has no template. */
    override fun get(volumeId: String): Template = templates[volumeId] ?: throw TemplateNotFoundException(volumeId)

    /** Builds deterministic mock assignments and preserves locked content during regeneration. */
    @Synchronized
    override fun generate(volumeId: String, settings: ScanTemplateSettings): Template {
        validateParameters(settings.replacementSourcesParameters)
        validateSources(volumeId, settings.replacementSources)
        val current = templates[volumeId]
        if (current == null && settings.version != null) throw VersionConflictException()
        if (current != null) {
            TemplateRules.checkVersion(current.version, settings.version)
            TemplateRules.checkEditable(current.state)
        }

        val now = Instant.now()
        val generated = generatedItems(volumeId, settings)
        val template = if (current == null) {
            Template(
                id = UUID.randomUUID().toString(),
                version = 0,
                state = TemplateState.CREATED,
                primaryVolume = mockVolume(volumeId, now),
                replacementSourcesParameters = settings.replacementSourcesParameters,
                primaryVolumeFillIndex = fillIndex(settings.issues, emptyList()),
                combinedFillIndex = fillIndex(settings.issues, settings.replacementSources.mapNotNull { it.volumeId }),
                items = generated,
                createdDate = now,
                modifiedDate = now,
            )
        } else {
            current.copy(
                version = current.nextVersion(),
                replacementSourcesParameters = settings.replacementSourcesParameters,
                primaryVolumeFillIndex = fillIndex(settings.issues, emptyList()),
                combinedFillIndex = fillIndex(settings.issues, settings.replacementSources.mapNotNull { it.volumeId }),
                items = mergeLockedItems(current.items, generated),
                modifiedDate = now,
            )
        }
        TemplateRules.validateTargetState(template.items, template.state)
        TemplateRules.validate(template.replacementSourcesParameters, template.items)
        generationSettings[volumeId] = settings
        return store(volumeId, template)
    }

    /** Applies frontend-editable fields, validates them, and advances the mock version. */
    @Synchronized
    override fun save(volumeId: String, submitted: Template): Template {
        val current = get(volumeId)
        TemplateRules.checkEditable(current.state)
        TemplateRules.checkVersion(current.version, submitted.version)
        val updated = applyEditableChanges(current, submitted).copy(
            version = current.nextVersion(),
            modifiedDate = Instant.now(),
        )
        TemplateRules.validateTargetState(updated.items, updated.state)
        TemplateRules.validate(updated.replacementSourcesParameters, updated.items)
        return store(volumeId, updated)
    }

    /** Regenerates unlocked mock assignments from the most recently submitted generation settings. */
    @Synchronized
    override fun synchronize(volumeId: String, version: Long): Template {
        val current = get(volumeId)
        TemplateRules.checkEditable(current.state)
        TemplateRules.checkVersion(current.version, version)
        val settings = generationSettings[volumeId] ?: throw InvalidTemplateException("Generation settings are missing")
        val synchronized = current.copy(
            version = current.nextVersion(),
            items = mergeLockedItems(current.items, generatedItems(volumeId, settings)),
            modifiedDate = Instant.now(),
        )
        TemplateRules.validateTargetState(synchronized.items, synchronized.state)
        TemplateRules.validate(synchronized.replacementSourcesParameters, synchronized.items)
        return store(volumeId, synchronized)
    }

    /** Validates and performs an allowed state transition as one synchronized in-memory operation. */
    @Synchronized
    override fun transition(volumeId: String, transition: TemplateTransition): Template {
        val current = get(volumeId)
        TemplateRules.checkVersion(current.version, transition.version)
        TemplateRules.checkTransition(current.state, transition.targetState)

        val changed = transition.changes?.let { applyEditableChanges(current, it) } ?: current
        TemplateRules.validateTargetState(changed.items, transition.targetState)
        TemplateRules.validate(changed.replacementSourcesParameters, changed.items)
        val transitioned = changed.copy(
            version = current.nextVersion(),
            state = transition.targetState,
            items = if (transition.targetState == TemplateState.FINALIZED) changed.items.map(TemplateItem::locked) else changed.items,
            modifiedDate = Instant.now(),
        )
        return store(volumeId, transitioned)
    }

    /** Removes an active template while retaining its snapshot as an in-memory tombstone. */
    @Synchronized
    override fun delete(volumeId: String) {
        val deleted = templates.remove(volumeId) ?: throw TemplateNotFoundException(volumeId)
        deletedTemplates[volumeId] = deleted
        generationSettings.remove(volumeId)
    }

    /** Produces deterministic candidate volumes after validating selected source ordering. */
    override fun replacementCandidates(volumeId: String, query: ReplacementCandidateQuery): List<ReplacementSource> {
        requireVolumeId(volumeId)
        validateParameters(query.replacementSourcesParameters)
        validateSources(volumeId, query.replacementSources)
        val startPriority = (query.replacementSources.mapNotNull { it.priority }.maxOrNull() ?: 0) + 1
        val selectedVolumeIds = query.replacementSources.mapNotNull { it.volumeId }
        return listOf(
            ReplacementSource(
                volumeId = UUID.nameUUIDFromBytes("$volumeId-candidate-1".toByteArray()).toString(),
                priority = startPriority,
                dependentFillIndex = fillIndex(query.issues, selectedVolumeIds + "candidate-1"),
                signature = "MOCK-SIGNATURE-1",
                owner = "MOCK_LIBRARY",
                barcode = "MOCK-BARCODE-1",
                mutation = "Mock mutation",
                mutationEdition = "A",
            ),
            ReplacementSource(
                volumeId = UUID.nameUUIDFromBytes("$volumeId-candidate-2".toByteArray()).toString(),
                priority = startPriority + 1,
                dependentFillIndex = fillIndex(query.issues, selectedVolumeIds + "candidate-2"),
                signature = "MOCK-SIGNATURE-2",
                owner = "SECOND_LIBRARY",
                barcode = "MOCK-BARCODE-2",
                mutation = "Mock mutation",
                mutationEdition = "B",
            ),
        )
    }

    /** Produces a deterministic mock fill index from enabled issue types and selected volume IDs. */
    override fun fillIndex(volumeId: String, query: FillIndexQuery): Int {
        requireVolumeId(volumeId)
        return fillIndex(query.issues, query.replacementSourcesIds)
    }

    /** Produces deterministic planning rows for every requested year. */
    override fun plan(query: TemplatePlanningQuery): TemplatePlanning {
        val yearFrom = query.yearFrom.toIntOrNull() ?: throw InvalidTemplateException("yearFrom must be a number")
        val yearTo = query.yearTo.toIntOrNull() ?: throw InvalidTemplateException("yearTo must be a number")
        if (yearFrom > yearTo) throw InvalidTemplateException("yearFrom must be less than or equal to yearTo")
        if (yearFrom !in 1800..2200 || yearTo - yearFrom > 100) {
            throw InvalidTemplateException("Requested year range is outside mock limits")
        }

        return (yearFrom..yearTo).map { year ->
            TemplatePlanningYear(
                year = year.toString(),
                libraries = listOf(
                    TemplatePlanningLibrary(
                        id = "mock-library",
                        shorthand = "MOCK",
                        volumes = listOf(
                            TemplatePlanningVolume(
                                id = UUID.nameUUIDFromBytes("${query.metaTitleId}-$year".toByteArray()).toString(),
                                number = "1",
                                fillIndex = 85000,
                            ),
                        ),
                    ),
                ),
            )
        }
    }

    /** Projects a finalized in-memory template into the public integration contract. */
    override fun getByBarcode(barcode: String): IntegrationTemplate {
        val template = templates.values.firstOrNull {
            it.state == TemplateState.FINALIZED && it.primaryVolume.barCode == barcode
        } ?: throw FinalizedTemplateNotFoundException(barcode)

        val specimens = template.items.map { item ->
            val replacementSource = (item.mainScan as? ReplacementMainScan)?.replacement?.volume
            IntegrationSpecimen(
                number = if (item.specimen.isAttachment) {
                    item.specimen.attachmentNumber.orEmpty()
                } else {
                    item.specimen.number.orEmpty()
                },
                mutationMark = IntegrationMutationMark(
                    mark = item.specimen.mutationMark.mark.orEmpty(),
                    type = item.specimen.mutationMark.type,
                ),
                isAttachment = item.specimen.isAttachment,
                volume = IntegrationVolume(
                    signature = (replacementSource?.signature ?: template.primaryVolume.signature).orEmpty(),
                    ownerSigla = replacementSource?.owner ?: "MOCK",
                ),
            )
        }
        return IntegrationTemplate(barcode = barcode, specimenCount = specimens.size, specimen = specimens)
    }

    /** Creates one representative template item that reflects the selected mock issue categories. */
    private fun generatedItems(volumeId: String, settings: ScanTemplateSettings): List<TemplateItem> {
        val source = settings.replacementSources.minByOrNull { it.priority ?: Int.MAX_VALUE } ?: ReplacementSource()
        val status = if (source.hasIdentity()) ReplacementStatus.ASSIGNED else ReplacementStatus.UNRESOLVED
        val mainScan = if (settings.issues.missingSpecimen) {
            ReplacementMainScan(
                locked = false,
                visible = false,
                replacement = MainReplacement(volume = source, pages = emptyList(), status = status),
            )
        } else {
            PrimaryMainScan(locked = false, visible = false)
        }
        val hasPageIssue = settings.issues.missingPages || settings.issues.damagedPages ||
            settings.issues.illegiblyBound || settings.issues.censored || settings.issues.degradation
        val pageReplacements = if (hasPageIssue) {
            listOf(Replacement(source, listOf(1, 2), status, locked = false, visible = false))
        } else {
            emptyList()
        }
        return listOf(
            TemplateItem(
                specimen = TemplateSpecimen(
                    id = UUID.nameUUIDFromBytes("$volumeId-specimen".toByteArray()).toString(),
                    number = "1",
                    publicationDate = "${LocalDate.now().year}-01-01",
                    mutationMark = MutationMark(mark = "A", type = MutationMarkType.MARK),
                    isAttachment = false,
                    numExists = !settings.issues.missingSpecimen,
                    numMissing = settings.issues.missingSpecimen,
                ),
                mainScan = mainScan,
                pageReplacements = pageReplacements,
            ),
        )
    }

    /** Merges submitted editable fields with server-owned identity, audit, and computed fields. */
    private fun applyEditableChanges(current: Template, submitted: Template): Template {
        if (submitted.primaryVolume.id != current.primaryVolume.id) {
            throw InvalidTemplateException("primaryVolume is server-owned")
        }
        return current.copy(
            replacementSourcesParameters = submitted.replacementSourcesParameters,
            items = TemplateRules.applyItems(current.items, submitted.items),
        )
    }

    /** Validates priority and volume uniqueness within selected replacement sources. */
    private fun validateSources(volumeId: String, sources: List<ReplacementSource>) {
        val priorities = sources.mapNotNull { it.priority }
        if (priorities.any { it <= 0 } || priorities.distinct().size != priorities.size) {
            throw InvalidTemplateException("Replacement source priorities must be positive and unique")
        }
        val volumeIds = sources.mapNotNull { it.volumeId }
        if (volumeId in volumeIds || volumeIds.distinct().size != volumeIds.size) {
            throw InvalidTemplateException("Replacement source volume IDs must be unique and exclude the primary volume")
        }
    }


    /** Rejects blank path identifiers before generating deterministic mock identifiers from them. */
    private fun requireVolumeId(volumeId: String) {
        if (volumeId.isBlank()) throw InvalidTemplateException("volumeId must not be blank")
    }

    /** Calculates the deterministic placeholder fill index used by all mock responses. */
    private fun fillIndex(issues: TemplateIssues, replacementSourcesIds: List<String>): Int {
        val issueCount = listOf(
            issues.missingPages,
            issues.damagedPages,
            issues.illegiblyBound,
            issues.missingSpecimen,
            issues.censored,
            issues.degradation,
        ).count { it }
        return (100000 - issueCount * 10000 + replacementSourcesIds.size * 5000).coerceIn(0, 100999)
    }

    /** Creates the frontend volume shape used as a server-owned primary-volume snapshot. */
    private fun mockVolume(volumeId: String, now: Instant) = Volume(
        id = volumeId,
        barCode = "MOCK-$volumeId",
        dateFrom = "${LocalDate.now().year}-01-01",
        dateTo = "${LocalDate.now().year}-12-31",
        metaTitleId = UUID.nameUUIDFromBytes("mock-metatitle".toByteArray()).toString(),
        subName = "Mock volume",
        mutationId = UUID.nameUUIDFromBytes("mock-mutation".toByteArray()).toString(),
        periodicity = emptyList(),
        firstNumber = 1,
        lastNumber = 1,
        note = "Mock data from permonik-export-api",
        attachmentsSort = VolumeAttachmentsSort.NONE,
        signature = "MOCK-SIGNATURE",
        ownerId = UUID.nameUUIDFromBytes("mock-owner".toByteArray()).toString(),
        year = LocalDate.now().year,
        mutationMark = MutationMark(mark = "A", type = MutationMarkType.MARK),
        created = now.toString(),
        createdBy = "mock-user",
        updated = now.toString(),
    )

    /** Normalizes transient visibility, replaces a tombstone, and stores the active mock template. */
    private fun store(volumeId: String, template: Template): Template = template.withoutVisibility().also {
        deletedTemplates.remove(volumeId)
        templates[volumeId] = it
    }
}

/** Advances a nullable persistence version, using zero for the first stored representation. */
private fun Template.nextVersion() = (version ?: -1) + 1

/** Removes frontend-only visibility values from every assignment before the template is retained. */
private fun Template.withoutVisibility() = copy(items = items.map(TemplateItem::withoutVisibility))

/** Combines regenerated content with prior locked assignments without creating overlapping page replacements. */
private fun mergeLockedItems(current: List<TemplateItem>, generated: List<TemplateItem>): List<TemplateItem> {
    val currentById = current.associateBy { it.specimen.id }
    return generated.map { item ->
        val previous = currentById[item.specimen.id] ?: return@map item
        val lockedReplacements = previous.pageReplacements.filter { it.locked }
        val lockedPages = lockedReplacements.flatMapTo(mutableSetOf()) { it.pages }
        val generatedReplacements = item.pageReplacements.mapNotNull { replacement ->
            replacement.copy(pages = replacement.pages.filterNot(lockedPages::contains)).takeIf { it.pages.isNotEmpty() }
        }
        item.copy(
            mainScan = if (previous.mainScan.locked) previous.mainScan else item.mainScan,
            pageReplacements = lockedReplacements + generatedReplacements,
            note = previous.note,
        )
    }
}
