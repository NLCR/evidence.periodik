package cz.incad.nkp.inprove.permonikexportapi.planning

import cz.incad.nkp.inprove.permonikexportapi.core.CoreVolumeClient
import cz.incad.nkp.inprove.permonikexportapi.core.StoredLocalizedName
import cz.incad.nkp.inprove.permonikexportapi.core.StoredMutationMark
import cz.incad.nkp.inprove.permonikexportapi.core.StoredOwner
import cz.incad.nkp.inprove.permonikexportapi.core.StoredSpecimenSnapshot
import cz.incad.nkp.inprove.permonikexportapi.core.StoredVolumeSnapshot
import cz.incad.nkp.inprove.permonikexportapi.core.VolumeCalculationService
import java.time.Instant
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.Mockito.doReturn
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify

class StoredTemplatePlanningServiceTest {
    private val core = mock(CoreVolumeClient::class.java)
    private val calculations = mock(VolumeCalculationService::class.java)
    private val service = StoredTemplatePlanningService(core, calculations)

    /** Checks chronological ordering, year clipping, continuation flags and page totals. */
    @Test
    fun groupsVolumesAndCalculatesIndividualIndexes() {
        val first =
            volume(id = "first", year = 1960, ownerId = "owner-a", barcode = "BARCODE-1")
                .copy(
                    dateFrom = Instant.parse("1960-03-01T00:00:00Z"),
                    dateTo = Instant.parse("1962-06-30T00:00:00Z"),
                    specimens =
                        listOf(
                            specimen("a", true, 12),
                            specimen("b", false, 20),
                            specimen("c", true, 8),
                        ),
                )
        val second = volume(id = "second", year = 1960, ownerId = "owner-a", barcode = "BARCODE-2")
        val third = volume(id = "third", year = 1960, ownerId = "owner-b", barcode = "BARCODE-3")
        val fourth =
            volume(id = "fourth", year = 1961, ownerId = "owner-b", barcode = "BARCODE-4")
                .copy(
                    dateFrom = Instant.parse("1961-02-01T00:00:00Z"),
                    dateTo = Instant.parse("1961-02-28T00:00:00Z"),
                )
        val query =
            TemplatePlanningQuery(
                metaTitleId = "title",
                yearFrom = 1960,
                yearTo = 1962,
                mutation = null,
            )
        val metadata =
            listOf(
                CoreVolumeClient.PlanningVolumeMetadata("first", "BARCODE-1", "owner-a", "A"),
                CoreVolumeClient.PlanningVolumeMetadata("second", "BARCODE-2", "owner-a", "A"),
                CoreVolumeClient.PlanningVolumeMetadata("third", "BARCODE-3", "owner-b", "B"),
                CoreVolumeClient.PlanningVolumeMetadata("fourth", "BARCODE-4", "owner-b", "B"),
            )
        doReturn(metadata).`when`(core).queryPlanningVolumes(query)
        doReturn(listOf(first, second, third, fourth))
            .`when`(core)
            .batchGetVolumeContents(listOf("first", "second", "third", "fourth"))
        doReturn(81000).`when`(calculations).calculateOwnFillIndex(first)
        doReturn(82000).`when`(calculations).calculateOwnFillIndex(second)
        doReturn(83000).`when`(calculations).calculateOwnFillIndex(third)
        doReturn(84000).`when`(calculations).calculateOwnFillIndex(fourth)

        val result = service.plan(query)

        assertEquals(listOf("1960", "1961", "1962"), result.map(TemplatePlanningYear::year))
        val libraries1960 = result[0].libraries.associateBy { it.id }
        val libraries1961 = result[1].libraries.associateBy { it.id }
        assertEquals(setOf("owner-a", "owner-b"), libraries1960.keys)
        assertEquals(
            listOf(
                TemplatePlanningVolume("second", "BARCODE-2", 82000, 1, 12, 0, false, false),
                TemplatePlanningVolume("first", "BARCODE-1", 81000, 3, 12, 20, false, true),
            ),
            libraries1960.getValue("owner-a").volumes,
        )
        assertEquals("BARCODE-3", libraries1960.getValue("owner-b").volumes.single().barCode)
        assertEquals(
            TemplatePlanningVolume("first", "BARCODE-1", 81000, 1, 12, 20, true, true),
            libraries1961.getValue("owner-a").volumes.single(),
        )
        assertEquals("B", libraries1961.getValue("owner-b").shorthand)
        assertEquals(
            TemplatePlanningVolume("fourth", "BARCODE-4", 84000, 2, 2, 0, false, false),
            libraries1961.getValue("owner-b").volumes.single(),
        )
        assertEquals(
            TemplatePlanningVolume("first", "BARCODE-1", 81000, 1, 6, 20, true, false),
            result[2].libraries.single().volumes.single(),
        )
        verify(calculations).calculateOwnFillIndex(first)

        val only1961 = query.copy(yearFrom = 1961, yearTo = 1961)
        doReturn(listOf(metadata.first(), metadata.last()))
            .`when`(core)
            .queryPlanningVolumes(only1961)
        doReturn(listOf(first, fourth))
            .`when`(core)
            .batchGetVolumeContents(listOf("first", "fourth"))
        val filtered = service.plan(only1961).single()
        assertEquals("1961", filtered.year)
        assertEquals(libraries1961, filtered.libraries.associateBy { it.id })
    }

    /** Creates valid source metadata for the planning fill-index boundary. */
    private fun volume(id: String, year: Int, ownerId: String, barcode: String) =
        StoredVolumeSnapshot(
            id = id,
            barcode = barcode,
            dateFrom = Instant.parse("$year-01-01T00:00:00Z"),
            dateTo = Instant.parse("$year-12-31T00:00:00Z"),
            metaTitleId = "title",
            metaTitleName = "Title",
            subName = null,
            mutationId = "mutation",
            mutationName = StoredLocalizedName("CS", "SK", "EN"),
            mutationMark = StoredMutationMark(null, "UNMARKED", null),
            owner = StoredOwner(id = ownerId, name = "Owner", shorthand = ownerId, sigla = ownerId),
            signature = null,
            year = year,
            firstNumber = 1,
            lastNumber = 2,
            note = null,
            attachmentsSort = "NONE",
            periodicity = emptyList(),
            created = Instant.EPOCH,
            createdBy = "user",
            updated = null,
            updatedBy = null,
            specimens = emptyList(),
        )

    /** Creates an issue with a recorded page count, even when not held by the volume. */
    private fun specimen(id: String, numExists: Boolean, pagesCount: Int) =
        StoredSpecimenSnapshot(
            id = id,
            publicationDate = Instant.parse("1960-03-01T00:00:00Z"),
            isAttachment = false,
            number = id,
            attachmentNumber = null,
            editionId = "edition",
            mutationId = "mutation",
            mutationMark = StoredMutationMark(null, "UNMARKED", null),
            name = null,
            subName = null,
            numExists = numExists,
            numMissing = !numExists,
            pagesCount = pagesCount,
            missingPages = emptyList(),
            damagedPages = emptyList(),
            damageTypes = emptyList(),
            note = null,
        )
}
