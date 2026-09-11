package cz.incad.nkp.inprove.permonikexportapi.core

import cz.incad.nkp.inprove.permonikexportapi.calculation.CombinedVolume
import cz.incad.nkp.inprove.permonikexportapi.calculation.CandidateEvaluation
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

    /** Evaluates all matching stored candidates against prior sources, excluding those already selected. */
    fun findReplacementCandidates(
        primaryVolumeId: String,
        replacementVolumeIds: List<String>,
        issues: IssueSelection,
        rules: SpecimenMatchingRules,
    ): List<CandidateEvaluation> {
        val selectedIds = listOf(primaryVolumeId) + replacementVolumeIds
        require(selectedIds.none(String::isBlank) && selectedIds.distinct().size == selectedIds.size) {
            "Expected distinct nonblank primary and replacement volume IDs"
        }
        val selected = selectedIds.chunked(20).flatMap(core::batchGetVolumeContents).map { it.toCalculationSnapshot() }
        val candidateIds = core.searchReplacementVolumeIds(primaryVolumeId, rules).filterNot(selectedIds.toSet()::contains)
        val candidates = candidateIds.chunked(20).flatMap(core::batchGetVolumeContents).map { it.toCalculationSnapshot() }
        return calculator.evaluateCandidates(selected.first(), selected.drop(1), candidates, issues, rules)
    }

    /** Calculates recorded coverage using explicit sources in priority order, without inferring missing issues. */
    fun calculate(
        primaryVolumeId: String,
        replacementVolumeIds: List<String>,
        issues: IssueSelection,
        rules: SpecimenMatchingRules,
    ): CombinedVolume {
        val ids = listOf(primaryVolumeId) + replacementVolumeIds
        require(ids.none(String::isBlank) && ids.distinct().size == ids.size) {
            "Expected distinct nonblank primary and replacement volume IDs"
        }
        val volumes = ids.chunked(20).flatMap(core::batchGetVolumeContents).map { it.toCalculationSnapshot() }
        return calculator.combine(volumes.first(), volumes.drop(1), issues, rules)
    }
}

/** Converts stored instants to UTC publication days and retains raw flags and page lists for calculation warnings. */
private fun StoredVolumeSnapshot.toCalculationSnapshot() = VolumeSnapshot(
    id = id,
    metaTitleId = metaTitleId,
    ownerId = owner.id,
    mutationId = mutationId,
    mutationMark = mutationMark.toCalculationMark(id),
    dateFrom = dateFrom.atZone(ZoneOffset.UTC).toLocalDate(),
    dateTo = dateTo.atZone(ZoneOffset.UTC).toLocalDate(),
    specimens = specimens.map { specimen ->
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

/** Rejects unsupported stored mark types rather than silently changing specimen matching semantics. */
private fun StoredMutationMark.toCalculationMark(sourceId: String): MutationMarkSnapshot {
    val kind = MutationMarkKind.entries.firstOrNull { it.name == type }
    requireNotNull(kind) { "Unsupported mutation mark type '$type' in source '$sourceId'" }
    return MutationMarkSnapshot(mark, kind)
}
