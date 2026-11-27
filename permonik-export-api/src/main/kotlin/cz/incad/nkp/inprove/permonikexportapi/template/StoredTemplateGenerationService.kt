package cz.incad.nkp.inprove.permonikexportapi.template

import cz.incad.nkp.inprove.permonikexportapi.calculation.IssueSelection
import cz.incad.nkp.inprove.permonikexportapi.calculation.SpecimenMatchingRules
import cz.incad.nkp.inprove.permonikexportapi.core.VolumeCalculationService
import cz.incad.nkp.inprove.permonikexportapi.template.persistence.StoredTemplate
import cz.incad.nkp.inprove.permonikexportapi.template.persistence.StoredTemplateRepository
import org.springframework.dao.OptimisticLockingFailureException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * Creates or regenerates persisted templates from real core snapshots and one calculation result.
 */
@Service
class StoredTemplateGenerationService(
    private val calculations: VolumeCalculationService,
    private val generator: TemplateGenerator,
    private val templates: StoredTemplateRepository,
) {
    /**
     * Generates a new template or replaces only unlocked assignments in an editable existing
     * template.
     */
    @Transactional
    fun generate(volumeId: String, settings: ScanTemplateSettings): StoredTemplate {
        TemplateRules.validateParameters(settings.replacementSourcesParameters)
        val sourceIds =
            settings.replacementSources
                .sortedBy { it.priority ?: Int.MAX_VALUE }
                .mapNotNull { it.volumeId }
        val calculation =
            calculations.calculateDetailed(
                primaryVolumeId = volumeId,
                replacementVolumeIds = sourceIds,
                issues = settings.issues.toIssueSelection(),
                rules = settings.replacementSourcesParameters.toMatchingRules(),
            )
        val generatedContent =
            generator.generate(
                primary = calculation.primary,
                sources = calculation.sources,
                calculation = calculation.combined,
                settings,
            )
        val current =
            templates.findActiveByVolumeId(volumeId)
                ?: return save(
                    StoredTemplate(
                        primaryVolumeId = volumeId,
                        ownerId = calculation.primary.owner.id,
                        state = TemplateState.CREATED,
                        content = generatedContent,
                    )
                )

        TemplateRules.checkVersion(current.version, settings.version)
        TemplateRules.checkEditable(current.state)
        val updated =
            current.copy(
                content =
                    generatedContent.copy(
                        items =
                            TemplateRules.mergeLockedItems(
                                current.content.items,
                                generatedContent.items,
                            )
                    )
            )
        TemplateRules.validate(updated.content.replacementSourcesParameters, updated.content.items)
        return save(updated)
    }

    /**
     * Regenerates the stored template from its saved generation inputs while preserving locked
     * assignments.
     */
    @Transactional
    fun synchronize(volumeId: String, version: Long): StoredTemplate {
        val current =
            templates.findActiveByVolumeId(volumeId) ?: throw TemplateNotFoundException(volumeId)
        return generate(
            volumeId,
            ScanTemplateSettings(
                issues = current.content.issues,
                replacementSourcesParameters = current.content.replacementSourcesParameters,
                replacementSources = current.content.replacementSources,
                primaryVolumeFillIndex = current.content.primaryVolumeFillIndex,
                version = version,
            ),
        )
    }

    /** Converts a stored optimistic-lock race into the API's version conflict. */
    private fun save(template: StoredTemplate): StoredTemplate =
        try {
            templates.save(template)
        } catch (_: OptimisticLockingFailureException) {
            throw VersionConflictException()
        }
}

/** Converts the FE issue switches to the calculation domain without changing their meaning. */
internal fun TemplateIssues.toIssueSelection() =
    IssueSelection(
        missingPages = missingPages,
        damagedPages = damagedPages,
        illegiblyBound = illegiblyBound,
        missingSpecimen = missingSpecimen,
        censored = censored,
        degradation = degradation,
    )

/**
 * Converts source matching settings to the calculation rules used by core candidate search and
 * projection.
 */
internal fun ReplacementSourcesParameters.toMatchingRules() =
    SpecimenMatchingRules(
        matchOwner = owner,
        matchMutation = mutation,
        matchMutationalEdition = mutationalEdition,
    )
