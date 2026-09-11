package cz.incad.nkp.inprove.permonikexportapi.calculation

import cz.incad.nkp.inprove.permonikdomain.SpecimenDamageType
import java.time.LocalDate

data class VolumeSnapshot(
    val id: String,
    val metaTitleId: String,
    val ownerId: String,
    val mutationId: String,
    val mutationMark: MutationMarkSnapshot,
    val dateFrom: LocalDate,
    val dateTo: LocalDate,
    val specimens: List<SpecimenSnapshot>,
)

data class SpecimenSnapshot(
    val id: String,
    val publicationDate: LocalDate,
    val isAttachment: Boolean,
    val number: String?,
    val attachmentNumber: String?,
    val editionId: String,
    val mutationId: String,
    val mutationMark: MutationMarkSnapshot,
    val name: String?,
    val subName: String?,
    val numExists: Boolean,
    val numMissing: Boolean,
    val pagesCount: Int,
    val missingPages: List<Int>,
    val damagedPages: List<Int>,
    val damageTypes: Set<String>,
)

data class MutationMarkSnapshot(
    val mark: String?,
    val type: MutationMarkKind,
)

enum class MutationMarkKind {
    MARK,
    NUMBER,
    UNMARKED,
}

data class IssueSelection(
    val missingPages: Boolean,
    val damagedPages: Boolean,
    val illegiblyBound: Boolean,
    val missingSpecimen: Boolean,
    val censored: Boolean,
    val degradation: Boolean,
)

data class FillIndex(
    val value: Int,
    val coverage: Int,
    val pageCompleteness: Int,
    val physicalCondition: Int,
    val secondaryCondition: Int,
    val warnings: List<CalculationWarning>,
)

data class CalculationWarning(
    val code: CalculationWarningCode,
    val specimenId: String? = null,
    val detail: String? = null,
)

enum class CalculationWarningCode {
    BOTH_EXISTING_AND_MISSING,
    UNKNOWN_EXISTENCE_EXCLUDED,
    NO_EXPECTED_SPECIMENS,
    NO_QUALITY_OBSERVATIONS,
    UNKNOWN_PAGE_COUNT,
    UNKNOWN_DAMAGE_TYPE,
    INVALID_PAGE_NUMBER,
    DUPLICATE_PAGE_NUMBER,
    AMBIGUOUS_SPECIMEN_MATCH,
}

data class SpecimenMatchingRules(
    val matchOwner: Boolean,
    val matchMutation: Boolean,
    val matchMutationalEdition: Boolean,
)

data class CombinedVolume(
    val snapshot: VolumeSnapshot,
    val fillIndex: FillIndex,
    val requiredUnits: Int,
    val remainingUnits: Int,
    val warnings: List<CalculationWarning>,
)

data class CandidateEvaluation(
    val volumeId: String,
    val eligible: Boolean,
    val dependentFillIndex: Int,
    val coveredRequiredUnits: Int,
    val remainingRequiredUnits: Int,
    val warnings: List<CalculationWarning>,
)

internal data class NormalizedPages(
    val values: Set<Int>,
    val invalid: Set<Int>,
    val hasDuplicates: Boolean,
)

/** Reports unrecognized damage codes without modifying the specimen or assigning an invented penalty. */
internal fun SpecimenSnapshot.unknownDamageWarnings(): List<CalculationWarning> =
    damageTypes.filter { SpecimenDamageType.fromCode(it) == null }.map { code ->
        CalculationWarning(CalculationWarningCode.UNKNOWN_DAMAGE_TYPE, id, code)
    }

/** Normalizes page numbers and preserves malformed input warnings for fill indexes and replacements. */
internal fun validPages(
    specimenId: String,
    pages: List<Int>,
    pageCount: Int?,
    warnings: MutableList<CalculationWarning>,
): Set<Int> {
    val normalized = normalizePages(pages, pageCount)
    if (normalized.hasDuplicates) {
        warnings += CalculationWarning(CalculationWarningCode.DUPLICATE_PAGE_NUMBER, specimenId)
    }
    normalized.invalid.forEach { page ->
        warnings += CalculationWarning(CalculationWarningCode.INVALID_PAGE_NUMBER, specimenId, page.toString())
    }
    return normalized.values
}

/** Normalizes page numbers before calculations while retaining information about malformed source data. */
internal fun normalizePages(pages: List<Int>, pageCount: Int?): NormalizedPages {
    val distinct = pages.distinct()
    val (valid, invalid) = distinct.partition { page ->
        page > 0 && (pageCount == null || page <= pageCount)
    }
    return NormalizedPages(
        values = valid.toCollection(linkedSetOf()),
        invalid = invalid.toSet(),
        hasDuplicates = distinct.size != pages.size,
    )
}
