package cz.incad.nkp.inprove.permonikexportapi.template

import cz.incad.nkp.inprove.permonikexportapi.calculation.IssueSelection
import cz.incad.nkp.inprove.permonikexportapi.calculation.ReplacementProjectionCalculator
import cz.incad.nkp.inprove.permonikexportapi.calculation.SpecimenMatchingRules
import cz.incad.nkp.inprove.permonikexportapi.calculation.specimen
import cz.incad.nkp.inprove.permonikexportapi.calculation.volume
import cz.incad.nkp.inprove.permonikexportapi.core.StoredLocalizedName
import cz.incad.nkp.inprove.permonikexportapi.core.StoredMutationMark
import cz.incad.nkp.inprove.permonikexportapi.core.StoredOwner
import cz.incad.nkp.inprove.permonikexportapi.core.StoredPeriodicityItem
import cz.incad.nkp.inprove.permonikexportapi.core.StoredSpecimenSnapshot
import cz.incad.nkp.inprove.permonikexportapi.core.StoredVolumeSnapshot
import java.time.Instant
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class TemplateGeneratorTest {
    /**
     * Verifies that the generator preserves barcode metadata and uses the calculated source
     * decision.
     */
    @Test
    fun generatesTemplateContentFromCalculationPlan() {
        val primary =
            storedVolume("primary", "PRIMARY-BARCODE", storedSpecimen(missingPages = listOf(1, 2)))
        val source =
            storedVolume("source", "SOURCE-BARCODE", storedSpecimen(id = "source-specimen"))
        val calculation =
            ReplacementProjectionCalculator()
                .combine(
                    primary =
                        volume(
                            specimens =
                                listOf(
                                    specimen(
                                        pagesCount = 2,
                                        missingPages = listOf(1, 2),
                                        damageTypes = setOf("ChS"),
                                    )
                                )
                        ),
                    sources =
                        listOf(
                            volume(
                                id = "source",
                                specimens =
                                    listOf(specimen(id = "source-specimen", pagesCount = 2)),
                            )
                        ),
                    issues =
                        TemplateIssues(
                                missingPages = true,
                                damagedPages = false,
                                illegiblyBound = false,
                                missingSpecimen = false,
                                censored = false,
                                degradation = false,
                            )
                            .toIssues(),
                    rules =
                        SpecimenMatchingRules(
                            matchOwner = false,
                            matchMutation = false,
                            matchMutationalEdition = false,
                        ),
                )
        val settings =
            ScanTemplateSettings(
                issues =
                    TemplateIssues(
                        missingPages = true,
                        damagedPages = false,
                        illegiblyBound = false,
                        missingSpecimen = false,
                        censored = false,
                        degradation = false,
                    ),
                replacementSourcesParameters =
                    ReplacementSourcesParameters(
                        metatitle = true,
                        mutation = false,
                        mutationalEdition = false,
                        owner = false,
                        timeOverlap = true,
                    ),
                replacementSources = listOf(ReplacementSource("source", 1, 90000)),
                primaryVolumeFillIndex = 0,
            )

        val content =
            TemplateGenerator().generate(primary, sources = listOf(source), calculation, settings)

        assertEquals("PRIMARY-BARCODE", content.primaryVolume.barCode)
        assertEquals(
            calculation.fillIndex.value,
            content.replacementSources.single().dependentFillIndex,
        )
        val replacement = content.items.single().pageReplacements.single()
        assertEquals(listOf(1, 2), replacement.pages)
        assertEquals("SOURCE-BARCODE", replacement.volume.barcode)
        assertEquals(ReplacementStatus.ASSIGNED, replacement.status)
        assertTrue(content.items.single().mainScan is PrimaryMainScan)
    }

    /** Converts the FE issue switches for the calculation used by this focused generator test. */
    private fun TemplateIssues.toIssues() =
        IssueSelection(
            missingPages = missingPages,
            damagedPages = damagedPages,
            illegiblyBound = illegiblyBound,
            missingSpecimen = missingSpecimen,
            censored = censored,
            degradation = degradation,
        )
}

/** Creates a complete stored volume fixture with source metadata needed by template generation. */
private fun storedVolume(id: String, barcode: String, specimen: StoredSpecimenSnapshot) =
    StoredVolumeSnapshot(
        id = id,
        barcode = barcode,
        dateFrom = Instant.parse("2025-01-01T00:00:00Z"),
        dateTo = Instant.parse("2025-12-31T00:00:00Z"),
        metaTitleId = "meta-title",
        metaTitleName = "Daily",
        subName = null,
        mutationId = "mutation",
        mutationName = StoredLocalizedName("Mutation", "Mutacia", "Mutation"),
        mutationMark = StoredMutationMark("A", "MARK", null),
        owner = StoredOwner(id = "owner", name = "Library", shorthand = "LIB", sigla = "LIB"),
        signature = "SIGNATURE-$id",
        year = 2025,
        firstNumber = 1,
        lastNumber = 2,
        note = null,
        attachmentsSort = "NONE",
        periodicity =
            listOf(
                StoredPeriodicityItem(
                    day = "Monday",
                    numExists = true,
                    editionId = "edition",
                    pagesCount = 2,
                    name = "Daily",
                    subName = "",
                    isAttachment = false,
                )
            ),
        created = Instant.parse("2025-01-01T00:00:00Z"),
        createdBy = "source-user",
        updated = null,
        updatedBy = null,
        specimens = listOf(specimen),
    )

/**
 * Creates one stored specimen with the same identity and issue data used by the calculation
 * fixture.
 */
private fun storedSpecimen(
    id: String = "specimen",
    missingPages: List<Int> = emptyList(),
) =
    StoredSpecimenSnapshot(
        id = id,
        publicationDate = Instant.parse("2025-01-02T00:00:00Z"),
        isAttachment = false,
        number = "A-002b",
        attachmentNumber = null,
        editionId = "edition",
        mutationId = "mutation",
        mutationMark = StoredMutationMark("A", "MARK", null),
        name = "Daily issue",
        subName = "Morning",
        numExists = true,
        numMissing = false,
        pagesCount = 2,
        missingPages = missingPages,
        damagedPages = emptyList(),
        damageTypes =
            if (missingPages.isEmpty()) {
                emptyList()
            } else {
                listOf("ChS")
            },
    )
