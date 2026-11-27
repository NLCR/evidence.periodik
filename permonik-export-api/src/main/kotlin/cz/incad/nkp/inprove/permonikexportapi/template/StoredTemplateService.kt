package cz.incad.nkp.inprove.permonikexportapi.template

import cz.incad.nkp.inprove.permonikexportapi.calculation.SpecimenMatchingRules
import cz.incad.nkp.inprove.permonikexportapi.core.StoredVolumeSnapshot
import cz.incad.nkp.inprove.permonikexportapi.core.VolumeCalculationService
import cz.incad.nkp.inprove.permonikexportapi.template.persistence.StoredTemplateRepository
import cz.incad.nkp.inprove.permonikexportapi.template.persistence.toHttpTemplate
import org.springframework.context.annotation.Primary
import org.springframework.stereotype.Service

/** Implements the persisted template lifecycle used by the export REST controller. */
@Service
@Primary
class StoredTemplateService(
    private val generation: StoredTemplateGenerationService,
    private val workflow: TemplateWorkflowService,
    private val calculations: VolumeCalculationService,
    private val templates: StoredTemplateRepository,
) : TemplateService {
    /** Returns the active persisted template after requiring complete audit and version data. */
    override fun get(volumeId: String): Template = active(volumeId).toHttpTemplate()

    /** Generates or regenerates a persisted template and maps the saved aggregate to HTTP. */
    override fun generate(volumeId: String, settings: ScanTemplateSettings): Template =
        generation.generate(volumeId, settings).toHttpTemplate()

    /** Saves editable assignments through the shared optimistic-lock workflow. */
    override fun save(volumeId: String, submitted: Template): Template =
        workflow.save(volumeId, submitted).toHttpTemplate()

    /** Applies and persists an atomic state transition through the shared workflow. */
    override fun transition(volumeId: String, transition: TemplateTransition): Template =
        workflow.transition(volumeId, transition).toHttpTemplate()

    /** Rebuilds unlocked assignments from the generation inputs stored in the current aggregate. */
    override fun synchronize(volumeId: String, version: Long): Template =
        generation.synchronize(volumeId, version).toHttpTemplate()

    /** Soft-deletes the active persisted template. */
    override fun delete(volumeId: String) {
        workflow.delete(volumeId)
    }

    /** Finds real core candidates and maps their server-owned metadata to replacement sources. */
    override fun replacementCandidates(
        volumeId: String,
        query: ReplacementCandidateQuery,
    ): List<ReplacementSource> {
        TemplateRules.validateParameters(query.replacementSourcesParameters)
        val selectedIds =
            query.replacementSources
                .sortedBy { it.priority ?: Int.MAX_VALUE }
                .mapNotNull { it.volumeId }
        val candidates =
            calculations.findReplacementCandidatesDetailed(
                primaryVolumeId = volumeId,
                replacementVolumeIds = selectedIds,
                issues = query.issues.toIssueSelection(),
                rules = query.replacementSourcesParameters.toMatchingRules(),
            )
        val nextPriority =
            (query.replacementSources.mapNotNull { it.priority }.maxOrNull() ?: 0) + 1
        return candidates.mapIndexed { index, candidate ->
            candidate.volume.toReplacementSource(
                nextPriority + index,
                candidate.evaluation.dependentFillIndex,
            )
        }
    }

    /** Calculates the recorded combined fill index for selected sources in their supplied order. */
    override fun fillIndex(volumeId: String, query: FillIndexQuery): Int =
        calculations
            .calculate(
                primaryVolumeId = volumeId,
                replacementVolumeIds = query.replacementSourcesIds,
                issues = query.issues.toIssueSelection(),
                rules =
                    SpecimenMatchingRules(
                        matchOwner = false,
                        matchMutation = false,
                        matchMutationalEdition = false,
                    ),
            )
            .fillIndex
            .value

    /** Loads the active aggregate or reports that the primary volume has no template. */
    private fun active(volumeId: String) =
        templates.findActiveByVolumeId(volumeId) ?: throw TemplateNotFoundException(volumeId)
}

/** Converts stored core metadata to the server-owned replacement source fields. */
private fun StoredVolumeSnapshot.toReplacementSource(priority: Int, dependentFillIndex: Int) =
    ReplacementSource(
        volumeId = id,
        priority = priority,
        dependentFillIndex = dependentFillIndex,
        signature = signature,
        owner = owner.sigla,
        barcode = barcode,
        mutation = mutationName.cs,
        mutationEdition = mutationMark.mark,
    )
