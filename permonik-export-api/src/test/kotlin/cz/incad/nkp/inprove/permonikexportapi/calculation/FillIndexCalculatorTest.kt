package cz.incad.nkp.inprove.permonikexportapi.calculation

import java.time.LocalDate
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class FillIndexCalculatorTest {
    private val calculator = FillIndexCalculator()

    /** Reports unknown codes without penalizing them or changing the original snapshot. */
    @Test
    fun preservesUnknownDamageWithoutInventingPenalty() {
        val specimen = specimen(damageTypes = setOf("OK", "ChCC", "FutureDamage"))

        val result = calculator.calculate(volume(specimens = listOf(specimen)))

        assertEquals(100999, result.value)
        assertEquals(
            listOf(CalculationWarning(CalculationWarningCode.UNKNOWN_DAMAGE_TYPE, specimen.id, "FutureDamage")),
            result.warnings,
        )
        assertEquals(setOf("OK", "ChCC", "FutureDamage"), specimen.damageTypes)
    }

    /** Verifies the approved packed formula across coverage and all three quality components. */
    @Test
    fun calculatesPackedIndexFromSpecimenCondition() {
        val existing = specimen(
            id = "existing",
            pagesCount = 10,
            missingPages = listOf(1, 2),
            damagedPages = listOf(3, 4),
            damageTypes = setOf("Deg", "ChPag"),
        )
        val missing = specimen(id = "missing", numExists = false, numMissing = true)

        val result = calculator.calculate(volume(specimens = listOf(existing, missing)))

        assertEquals(50, result.coverage)
        assertEquals(7, result.pageCompleteness)
        assertEquals(5, result.physicalCondition)
        assertEquals(8, result.secondaryCondition)
        assertEquals(50758, result.value)
    }

    /** Verifies the upper bound produced by a complete volume without known defects. */
    @Test
    fun healthyVolumeHasMaximumIndex() {
        val result = calculator.calculate(volume(specimens = listOf(specimen())))

        assertEquals(100999, result.value)
        assertTrue(result.warnings.isEmpty())
    }

    /** Verifies that a whole-document damage code without page numbers contributes its full penalty. */
    @Test
    fun wholeDocumentDamageUsesFullPenalty() {
        val damaged = specimen(damagedPages = listOf(0), damageTypes = setOf("PP"))

        val result = calculator.calculate(volume(specimens = listOf(damaged)))

        assertEquals(6, result.physicalCondition)
        assertTrue(result.warnings.any { it.code == CalculationWarningCode.INVALID_PAGE_NUMBER })
    }

    /** Verifies that a stored zero page count omits ratios but retains observed physical penalties. */
    @Test
    fun unknownPageCountStillUsesKnownConditionFlags() {
        val result = calculator.calculate(volume(specimens = listOf(specimen(pagesCount = 0, damageTypes = setOf("Deg")))))

        assertEquals(0, result.pageCompleteness)
        assertEquals(5, result.physicalCondition)
        assertEquals(100059, result.value)
        assertTrue(result.warnings.any { it.code == CalculationWarningCode.UNKNOWN_PAGE_COUNT })
    }

    /** Verifies conservative zero components and warnings when no specimen has known existence. */
    @Test
    fun reportsUnknownDataInsteadOfInventingQuality() {
        val unknown = specimen(numExists = false, numMissing = false, pagesCount = 0)

        val result = calculator.calculate(volume(specimens = listOf(unknown)))

        assertEquals(0, result.value)
        assertTrue(result.warnings.any { it.code == CalculationWarningCode.UNKNOWN_EXISTENCE_EXCLUDED })
        assertTrue(result.warnings.any { it.code == CalculationWarningCode.NO_EXPECTED_SPECIMENS })
        assertEquals(3, result.warnings.count { it.code == CalculationWarningCode.NO_QUALITY_OBSERVATIONS })
    }
}

/** Creates a volume snapshot with stable matching metadata for calculation scenarios. */
internal fun volume(
    id: String = "primary",
    ownerId: String = "owner",
    specimens: List<SpecimenSnapshot>,
) = VolumeSnapshot(
    id = id,
    metaTitleId = "meta-title",
    ownerId = ownerId,
    mutationId = "mutation",
    mutationMark = MutationMarkSnapshot("A", MutationMarkKind.MARK),
    dateFrom = LocalDate.of(2025, 1, 1),
    dateTo = LocalDate.of(2025, 12, 31),
    specimens = specimens,
)

/** Creates one specimen snapshot with healthy defaults and configurable condition data. */
internal fun specimen(
    id: String = "specimen",
    numExists: Boolean = true,
    numMissing: Boolean = false,
    pagesCount: Int = 10,
    missingPages: List<Int> = emptyList(),
    damagedPages: List<Int> = emptyList(),
    damageTypes: Set<String> = emptySet(),
) = SpecimenSnapshot(
    id = id,
    publicationDate = LocalDate.of(2025, 1, 2),
    isAttachment = false,
    number = "A-002b",
    attachmentNumber = null,
    editionId = "edition",
    mutationId = "mutation",
    mutationMark = MutationMarkSnapshot("A", MutationMarkKind.MARK),
    name = "Daily issue",
    subName = "Morning",
    numExists = numExists,
    numMissing = numMissing,
    pagesCount = pagesCount,
    missingPages = missingPages,
    damagedPages = damagedPages,
    damageTypes = damageTypes,
)
