package cz.incad.nkp.inprove.permonikexportapi.core

import cz.incad.nkp.inprove.permonikexportapi.calculation.CandidateEvaluation
import cz.incad.nkp.inprove.permonikexportapi.calculation.CombinedVolume
import cz.incad.nkp.inprove.permonikexportapi.calculation.FillIndexCalculator
import cz.incad.nkp.inprove.permonikexportapi.calculation.IssueSelection
import cz.incad.nkp.inprove.permonikexportapi.calculation.MutationMarkKind
import cz.incad.nkp.inprove.permonikexportapi.calculation.MutationMarkSnapshot
import cz.incad.nkp.inprove.permonikexportapi.calculation.ReplacementProjectionCalculator
import cz.incad.nkp.inprove.permonikexportapi.calculation.SpecimenMatchingRules
import cz.incad.nkp.inprove.permonikexportapi.calculation.SpecimenSnapshot
import cz.incad.nkp.inprove.permonikexportapi.calculation.VolumeSnapshot
import java.time.ZoneOffset
import org.springframework.stereotype.Service

@Service
class VolumeCalculationService(private val core: CoreVolumeClient) {
    private val calculator = ReplacementProjectionCalculator()
    private val fillIndexCalculator = FillIndexCalculator()

    /**
     * Evaluates all matching stored candidates against prior sources, excluding those already
     * selected.
     */
    fun findReplacementCandidates(
        primaryVolumeId: String,
        replacementVolumeIds: List<String>,
        issues: IssueSelection,
        rules: SpecimenMatchingRules,
    ): List<CandidateEvaluation> =
        findReplacementCandidatesDetailed(
                primaryVolumeId,
                replacementVolumeIds,
                issues,
                rules,
            )
            .map(VolumeCandidate::evaluation)

    /** Evaluates candidates and retains the stored metadata needed by the template response. */
    fun findReplacementCandidatesDetailed(
        primaryVolumeId: String,
        replacementVolumeIds: List<String>,
        issues: IssueSelection,
        rules: SpecimenMatchingRules,
    ): List<VolumeCandidate> {
        val selectedIds = listOf(primaryVolumeId) + replacementVolumeIds
        require(
            selectedIds.none(String::isBlank) && selectedIds.distinct().size == selectedIds.size
        ) {
            "Expected distinct nonblank primary and replacement volume IDs"
        }
        val selected =
            selectedIds.chunked(20).flatMap(core::batchGetVolumeContents).map {
                it.toCalculationSnapshot()
            }
        val candidateIds =
            core
                .searchReplacementVolumeIds(primaryVolumeId, rules)
                .filterNot(selectedIds.toSet()::contains)
        val storedCandidates = candidateIds.chunked(20).flatMap(core::batchGetVolumeContents)
        val candidates = storedCandidates.map(StoredVolumeSnapshot::toCalculationSnapshot)
        val evaluations =
            calculator.evaluateCandidates(
                selected.first(),
                selected.drop(1),
                candidates,
                issues,
                rules,
            )
        val storedById = storedCandidates.associateBy(StoredVolumeSnapshot::id)
        return evaluations.map { evaluation ->
            VolumeCandidate(storedById.getValue(evaluation.volumeId), evaluation)
        }
    }

    /**
     * Calculates recorded coverage using explicit sources in priority order, without inferring
     * missing issues.
     */
    fun calculate(
        primaryVolumeId: String,
        replacementVolumeIds: List<String>,
        issues: IssueSelection,
        rules: SpecimenMatchingRules,
    ): CombinedVolume =
        calculateDetailed(primaryVolumeId, replacementVolumeIds, issues, rules).combined

    /**
     * Loads source snapshots once and returns them together with the single projected calculation.
     */
    fun calculateDetailed(
        primaryVolumeId: String,
        replacementVolumeIds: List<String>,
        issues: IssueSelection,
        rules: SpecimenMatchingRules,
    ): VolumeCalculation {
        val ids = listOf(primaryVolumeId) + replacementVolumeIds
        require(ids.none(String::isBlank) && ids.distinct().size == ids.size) {
            "Expected distinct nonblank primary and replacement volume IDs"
        }
        val storedVolumes = ids.chunked(20).flatMap(core::batchGetVolumeContents)
        val volumes = storedVolumes.map(StoredVolumeSnapshot::toCalculationSnapshot)
        return VolumeCalculation(
            primary = storedVolumes.first(),
            sources = storedVolumes.drop(1),
            combined = calculator.combine(volumes.first(), volumes.drop(1), issues, rules),
        )
    }

    /** Calculates one volume's recorded fill index without applying replacement sources. */
    fun calculateOwnFillIndex(volume: StoredVolumeSnapshot): Int =
        fillIndexCalculator.calculate(volume.toCalculationSnapshot()).value
}

/** Holds the stored source snapshots needed to turn one calculation into template content. */
data class VolumeCalculation(
    val primary: StoredVolumeSnapshot,
    val sources: List<StoredVolumeSnapshot>,
    val combined: CombinedVolume,
)

/**
 * Pairs one stored candidate volume with the calculation that ranked its projected contribution.
 */
data class VolumeCandidate(
    val volume: StoredVolumeSnapshot,
    val evaluation: CandidateEvaluation,
)

/**
 * Converts stored instants to UTC publication days and retains raw flags and page lists for
 * calculation warnings.
 */
private fun StoredVolumeSnapshot.toCalculationSnapshot() =
    VolumeSnapshot(
        id = id,
        metaTitleId = metaTitleId,
        ownerId = owner.id,
        mutationId = mutationId,
        mutationMark = mutationMark.toCalculationMark(id),
        dateFrom = dateFrom.atZone(ZoneOffset.UTC).toLocalDate(),
        dateTo = dateTo.atZone(ZoneOffset.UTC).toLocalDate(),
        specimens =
            specimens.map { specimen ->
                SpecimenSnapshot(
                    id = specimen.id,
                    publicationDate = specimen.publicationDate.atZone(ZoneOffset.UTC).toLocalDate(),
                    isAttachment = specimen.isAttachment,
                    number = specimen.number,
                    attachmentNumber = specimen.attachmentNumber,
                    editionId = specimen.editionId,
                    mutationId = specimen.mutationId,
                    mutationMark = specimen.mutationMark.toCalculationMark(specimen.id),
                    name = specimen.name,
                    subName = specimen.subName,
                    numExists = specimen.numExists,
                    numMissing = specimen.numMissing,
                    pagesCount = specimen.pagesCount,
                    missingPages = specimen.missingPages,
                    damagedPages = specimen.damagedPages,
                    damageTypes = specimen.damageTypes.toSet(),
                )
            },
    )

/**
 * Rejects unsupported stored mark types rather than silently changing specimen matching semantics.
 */
private fun StoredMutationMark.toCalculationMark(sourceId: String): MutationMarkSnapshot {
    val kind = MutationMarkKind.entries.firstOrNull { it.name == type }
    requireNotNull(kind) { "Unsupported mutation mark type '$type' in source '$sourceId'" }
    return MutationMarkSnapshot(mark, kind)
}
