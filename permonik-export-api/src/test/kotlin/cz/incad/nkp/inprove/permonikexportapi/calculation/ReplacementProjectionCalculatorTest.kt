package cz.incad.nkp.inprove.permonikexportapi.calculation

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class ReplacementProjectionCalculatorTest {
    private val calculator = ReplacementProjectionCalculator()

    /**
     * Verifies that prioritized sources can resolve separate pages and produce the projected
     * combined index.
     */
    @Test
    fun combinesPartialPageCoverageAcrossSources() {
        val primary =
            volume(
                specimens =
                    listOf(
                        specimen(
                            pagesCount = 2,
                            missingPages = listOf(1, 2),
                            damageTypes = setOf("ChS"),
                        )
                    )
            )
        val firstSource =
            volume(
                id = "source-1",
                specimens =
                    listOf(
                        specimen(id = "source-specimen-1", pagesCount = 2, missingPages = listOf(2))
                    ),
            )
        val secondSource =
            volume(
                id = "source-2",
                specimens = listOf(specimen(id = "source-specimen-2", pagesCount = 2)),
            )

        val result =
            calculator.evaluateCandidate(
                primary = primary,
                selectedSources = listOf(firstSource),
                candidate = secondSource,
                issues = missingPagesOnly,
                rules = noOptionalMatching,
            )

        assertTrue(result.eligible)
        assertEquals(1, result.coveredRequiredUnits)
        assertEquals(0, result.remainingRequiredUnits)
        assertEquals(100999, result.dependentFillIndex)
    }

    /**
     * Verifies that the projection records each source decision in the same priority order as the
     * snapshot changes.
     */
    @Test
    fun recordsPageReplacementPlanDuringProjection() {
        val primary =
            volume(
                specimens =
                    listOf(
                        specimen(
                            pagesCount = 2,
                            missingPages = listOf(1, 2),
                            damageTypes = setOf("ChS"),
                        )
                    )
            )
        val firstSource =
            volume(
                id = "source-1",
                specimens =
                    listOf(
                        specimen(id = "source-specimen-1", pagesCount = 2, missingPages = listOf(2))
                    ),
            )
        val secondSource =
            volume(
                id = "source-2",
                specimens = listOf(specimen(id = "source-specimen-2", pagesCount = 2)),
            )

        val result =
            calculator.combine(
                primary,
                listOf(firstSource, secondSource),
                missingPagesOnly,
                noOptionalMatching,
            )

        assertEquals(
            listOf(
                ReplacementDecision("source-1", "source-specimen-1", listOf(1)),
                ReplacementDecision("source-2", "source-specimen-2", listOf(2)),
            ),
            result.replacementPlan.items.single().pageReplacements,
        )
        assertNull(result.replacementPlan.items.single().mainReplacement)
        assertEquals(0, result.remainingUnits)
        assertTrue(result.replacementPlan.unresolved.isEmpty())
    }

    /** Verifies that a whole-specimen replacement is recorded separately from page replacements. */
    @Test
    fun recordsWholeReplacementPlan() {
        val primary = volume(specimens = listOf(specimen(numExists = false, numMissing = true)))
        val source = volume(id = "source", specimens = listOf(specimen(id = "source-specimen")))

        val result =
            calculator.combine(
                primary,
                listOf(source),
                missingSpecimenOnly,
                noOptionalMatching,
            )

        assertEquals(
            ReplacementDecision("source", "source-specimen"),
            result.replacementPlan.items.single().mainReplacement,
        )
        assertTrue(result.replacementPlan.items.single().pageReplacements.isEmpty())
        assertEquals(0, result.remainingUnits)
        assertTrue(result.replacementPlan.unresolved.isEmpty())
    }

    /**
     * Verifies that unresolved whole and page requirements are returned explicitly for later
     * template statuses.
     */
    @Test
    fun recordsUnresolvedReplacementUnits() {
        val primary =
            volume(
                specimens =
                    listOf(
                        specimen(
                            numExists = false,
                            numMissing = true,
                            pagesCount = 2,
                            missingPages = listOf(1, 2),
                        )
                    )
            )

        val result =
            calculator.combine(primary, emptyList(), missingSpecimenAndPages, noOptionalMatching)

        assertEquals(
            listOf(
                UnresolvedReplacement("specimen"),
                UnresolvedReplacement("specimen", 1),
                UnresolvedReplacement("specimen", 2),
            ),
            result.replacementPlan.unresolved,
        )
    }

    /**
     * Verifies that resolving a baseline whole requirement is counted even when source page defects
     * remain.
     */
    @Test
    fun measuresCoverageAgainstBaselineRequirements() {
        val primary = volume(specimens = listOf(specimen(numExists = false, numMissing = true)))
        val candidate =
            volume(
                id = "source",
                specimens =
                    listOf(
                        specimen(
                            id = "source-specimen",
                            missingPages = listOf(1),
                            damageTypes = setOf("ChS"),
                        )
                    ),
            )

        val result =
            calculator.evaluateCandidate(
                primary = primary,
                selectedSources = emptyList(),
                candidate = candidate,
                issues = missingSpecimenAndPages,
                rules = noOptionalMatching,
            )

        assertEquals(1, result.coveredRequiredUnits)
        assertEquals(1, result.remainingRequiredUnits)
    }

    /**
     * Verifies that selected whole defects cannot supply pages and damaged pages are never
     * tolerated.
     */
    @Test
    fun rejectsUnusablePageSources() {
        val primary = volume(specimens = listOf(specimen(missingPages = listOf(1))))
        val issues =
            missingPagesOnly.copy(illegiblyBound = true, censored = true, degradation = true)
        val defectiveSources =
            listOf(
                specimen(damageTypes = setOf("NS")),
                specimen(damageTypes = setOf("Deg")),
                specimen(damageTypes = setOf("Cz")),
                specimen(damageTypes = setOf("ChS")),
                specimen(damageTypes = setOf("PP")),
                specimen(damagedPages = listOf(1)),
            )

        defectiveSources.forEach { source ->
            val result =
                calculator.evaluateCandidate(
                    primary,
                    emptyList(),
                    volume(id = "source", specimens = listOf(source)),
                    issues,
                    noOptionalMatching,
                )
            assertEquals(0, result.coveredRequiredUnits, source.toString())
            assertEquals(1, result.remainingRequiredUnits, source.toString())
        }
    }

    /**
     * Verifies independent candidate projections, distinct page counters and retained input
     * warnings.
     */
    @Test
    fun evaluatesCandidatesFromSharedBaselineWithoutLosingWarnings() {
        val primary =
            volume(
                specimens =
                    listOf(specimen(missingPages = listOf(1, 1, 2), damagedPages = listOf(2)))
            )
        val selected =
            volume(
                id = "selected",
                specimens = listOf(specimen(id = "selected-specimen", missingPages = listOf(2, 0))),
            )
        val healthy = volume(id = "a", specimens = listOf(specimen(id = "healthy")))
        val damaged =
            volume(id = "b", specimens = listOf(specimen(id = "damaged", damagedPages = listOf(2))))
        val issues = missingPagesOnly.copy(damagedPages = true)

        val baseline = calculator.combine(primary, listOf(selected), issues, noOptionalMatching)
        val results =
            calculator.evaluateCandidates(
                primary,
                listOf(selected),
                listOf(damaged, healthy),
                issues,
                noOptionalMatching,
            )

        assertEquals(2, baseline.requiredUnits)
        assertEquals(1, baseline.remainingUnits)
        assertEquals(listOf("a", "b"), results.map { it.volumeId })
        assertEquals(listOf(1, 0), results.map { it.coveredRequiredUnits })
        assertEquals(listOf(0, 1), results.map { it.remainingRequiredUnits })
        assertEquals(100999, results.first().dependentFillIndex)
        results.forEach { result ->
            assertTrue(
                result.warnings.contains(
                    CalculationWarning(
                        CalculationWarningCode.INVALID_PAGE_NUMBER,
                        "selected-specimen",
                        "0",
                    )
                )
            )
            assertTrue(
                result.warnings.contains(
                    CalculationWarning(CalculationWarningCode.DUPLICATE_PAGE_NUMBER, "specimen")
                )
            )
        }
        assertEquals(listOf(1, 1, 2), primary.specimens.single().missingPages)
    }

    /** Verifies stable natural matching of padded numeric fragments and case differences. */
    @Test
    fun matchesNaturalSpecimenIdentifiers() {
        val matcher = SpecimenMatcher()

        assertTrue(matcher.identifiersEqual(" A-002b ", "a-2B"))
    }

    /**
     * Verifies that attachment identity ignores the normal number and includes attachment names.
     */
    @Test
    fun matchesAttachmentsByAttachmentIdentity() {
        val matcher = SpecimenMatcher()
        val target =
            specimen()
                .copy(
                    isAttachment = true,
                    number = "parent-1",
                    attachmentNumber = "A-02",
                    name = "Supplement",
                )
        val candidate =
            target.copy(id = "candidate", number = "different-parent", attachmentNumber = "a-2")

        assertTrue(matcher.matches(target, candidate, noOptionalMatching))
        assertFalse(
            matcher.matches(
                target,
                candidate.copy(name = "Different supplement"),
                noOptionalMatching,
            )
        )
    }

    /** Verifies inclusive overlap at the required stored boundaries. */
    @Test
    fun requiresInclusiveDateOverlap() {
        val primary = volume(specimens = listOf(specimen()))
        val candidate =
            volume(id = "source", specimens = listOf(specimen())).copy(dateFrom = primary.dateTo)

        assertTrue(calculator.isEligible(primary, candidate, noOptionalMatching))
        assertFalse(
            calculator.isEligible(
                primary,
                candidate.copy(
                    dateFrom = primary.dateTo.plusDays(1),
                    dateTo = primary.dateTo.plusDays(2),
                ),
                noOptionalMatching,
            )
        )
    }
}

private val missingPagesOnly =
    IssueSelection(
        missingPages = true,
        damagedPages = false,
        illegiblyBound = false,
        missingSpecimen = false,
        censored = false,
        degradation = false,
    )

private val missingSpecimenAndPages = missingPagesOnly.copy(missingSpecimen = true)

private val missingSpecimenOnly =
    IssueSelection(
        missingPages = false,
        damagedPages = false,
        illegiblyBound = false,
        missingSpecimen = true,
        censored = false,
        degradation = false,
    )

private val noOptionalMatching =
    SpecimenMatchingRules(
        matchOwner = false,
        matchMutation = false,
        matchMutationalEdition = false,
    )
