package cz.incad.nkp.inprove.permonikexportapi.calculation

import cz.incad.nkp.inprove.permonikdomain.SpecimenDamageType.*
import kotlin.math.roundToInt

class FillIndexCalculator {
    /**
     * Calculates the packed fill index and preserves data-quality problems as structured warnings.
     */
    fun calculate(volume: VolumeSnapshot): FillIndex {
        val warnings = volume.specimens.flatMap { it.unknownDamageWarnings() }.toMutableList()
        val expected =
            volume.specimens.filter { specimen ->
                when {
                    specimen.numExists && specimen.numMissing -> {
                        warnings +=
                            CalculationWarning(
                                CalculationWarningCode.BOTH_EXISTING_AND_MISSING,
                                specimen.id,
                            )
                        true
                    }
                    !specimen.numExists && !specimen.numMissing -> {
                        warnings +=
                            CalculationWarning(
                                CalculationWarningCode.UNKNOWN_EXISTENCE_EXCLUDED,
                                specimen.id,
                            )
                        false
                    }
                    else -> true
                }
            }

        val existing = expected.filter(SpecimenSnapshot::numExists)
        val coverage =
            if (expected.isEmpty()) {
                warnings += CalculationWarning(CalculationWarningCode.NO_EXPECTED_SPECIMENS)
                0
            } else {
                (existing.size * 100.0 / expected.size).roundToInt()
            }

        val pageQuality = mutableListOf<Double>()
        val physicalQuality = mutableListOf<Double>()
        val secondaryQuality = mutableListOf<Double>()
        existing.forEach { specimen ->
            val pageCount = specimen.pagesCount.takeIf { it > 0 }
            if (pageCount == null) {
                warnings +=
                    CalculationWarning(CalculationWarningCode.UNKNOWN_PAGE_COUNT, specimen.id)
            }
            val missingPages = validPages(specimen.id, specimen.missingPages, pageCount, warnings)
            val damagedPages = validPages(specimen.id, specimen.damagedPages, pageCount, warnings)

            if (pageCount != null) {
                pageQuality += 1.0 - missingPages.size.toDouble() / pageCount
            }

            val damagePenalty =
                when {
                    DAMAGED_DOCUMENT.code in specimen.damageTypes && damagedPages.isEmpty() -> 1.0
                    pageCount != null -> damagedPages.size.toDouble() / pageCount
                    else -> null
                }
            val physicalPenalties =
                listOfNotNull(
                    damagePenalty,
                    if (DEGRADATION.code in specimen.damageTypes) {
                        1.0
                    } else {
                        0.0
                    },
                    if (ILLEGIBLE_BINDING.code in specimen.damageTypes) {
                        1.0
                    } else {
                        0.0
                    },
                )
            physicalQuality += 1.0 - physicalPenalties.average()

            val secondaryDefects = SECONDARY_DAMAGE_TYPES.count(specimen.damageTypes::contains)
            secondaryQuality += 1.0 - secondaryDefects.toDouble() / SECONDARY_DAMAGE_TYPES.size
        }

        val pageCompleteness = qualityDigit("pageCompleteness", pageQuality, warnings)
        val physicalCondition = qualityDigit("physicalCondition", physicalQuality, warnings)
        val secondaryCondition = qualityDigit("secondaryCondition", secondaryQuality, warnings)
        return FillIndex(
            value =
                coverage * 1000 +
                    pageCompleteness * 100 +
                    physicalCondition * 10 +
                    secondaryCondition,
            coverage = coverage,
            pageCompleteness = pageCompleteness,
            physicalCondition = physicalCondition,
            secondaryCondition = secondaryCondition,
            warnings = warnings.toList(),
        )
    }

    /**
     * Converts averaged quality observations to one decimal digit, using zero when no observation
     * exists.
     */
    private fun qualityDigit(
        component: String,
        observations: List<Double>,
        warnings: MutableList<CalculationWarning>,
    ): Int {
        if (observations.isEmpty()) {
            warnings +=
                CalculationWarning(
                    CalculationWarningCode.NO_QUALITY_OBSERVATIONS,
                    detail = component,
                )
            return 0
        }
        return (observations.average() * 9).roundToInt().coerceIn(0, 9)
    }
}

private val SECONDARY_DAMAGE_TYPES =
    setOf(
            INCORRECT_PAGINATION,
            INCORRECT_DATE,
            INCORRECT_NUMBERING,
            INCORRECT_BINDING,
            CENSORED,
            CENSORED_COPY,
        )
        .map { it.code }
        .toSet()
