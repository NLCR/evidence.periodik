package cz.incad.nkp.inprove.permonikexportapi.planning

import cz.incad.nkp.inprove.permonikexportapi.core.CoreVolumeClient
import cz.incad.nkp.inprove.permonikexportapi.core.StoredLocalizedName
import cz.incad.nkp.inprove.permonikexportapi.core.StoredMutationMark
import cz.incad.nkp.inprove.permonikexportapi.core.StoredOwner
import cz.incad.nkp.inprove.permonikexportapi.core.StoredVolumeSnapshot
import cz.incad.nkp.inprove.permonikexportapi.core.VolumeCalculationService
import java.time.Instant
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.Mockito.doReturn
import org.mockito.Mockito.mock

class StoredTemplatePlanningServiceTest {
    private val core = mock(CoreVolumeClient::class.java)
    private val calculations = mock(VolumeCalculationService::class.java)
    private val service = StoredTemplatePlanningService(core, calculations)

    /**
     * Verifies core pagination results are grouped by year and owner while preserving the barcode.
     */
    @Test
    fun groupsVolumesAndCalculatesIndividualIndexes() {
        val first = volume("first", 1960, "owner-a", "BARCODE-1")
        val second = volume("second", 1960, "owner-a", "BARCODE-2")
        val third = volume("third", 1960, "owner-b", "BARCODE-3")
        val fourth = volume("fourth", 1961, "owner-b", "BARCODE-4")
        val query = TemplatePlanningQuery("title", "1960", "1961", null, MutationalEditionFilter())
        doReturn(
                listOf(
                    CoreVolumeClient.PlanningVolumeMetadata(
                        "first",
                        1960,
                        "BARCODE-1",
                        "owner-a",
                        "A",
                    ),
                    CoreVolumeClient.PlanningVolumeMetadata(
                        "second",
                        1960,
                        "BARCODE-2",
                        "owner-a",
                        "A",
                    ),
                    CoreVolumeClient.PlanningVolumeMetadata(
                        "third",
                        1960,
                        "BARCODE-3",
                        "owner-b",
                        "B",
                    ),
                    CoreVolumeClient.PlanningVolumeMetadata(
                        "fourth",
                        1961,
                        "BARCODE-4",
                        "owner-b",
                        "B",
                    ),
                )
            )
            .`when`(core)
            .queryPlanningVolumes(query)
        doReturn(listOf(first, second, third, fourth))
            .`when`(core)
            .batchGetVolumeContents(listOf("first", "second", "third", "fourth"))
        doReturn(81000).`when`(calculations).calculateOwnFillIndex(first)
        doReturn(82000).`when`(calculations).calculateOwnFillIndex(second)
        doReturn(83000).`when`(calculations).calculateOwnFillIndex(third)
        doReturn(84000).`when`(calculations).calculateOwnFillIndex(fourth)

        val result = service.plan(query)

        assertEquals(listOf("1960", "1961"), result.map(TemplatePlanningYear::year))
        assertEquals(
            listOf("BARCODE-1", "BARCODE-2"),
            result[0].libraries[0].volumes.map { it.barCode },
        )
        assertEquals(listOf(81000, 82000), result[0].libraries[0].volumes.map { it.fillIndex })
        assertEquals(listOf("owner-a", "owner-b"), result[0].libraries.map { it.id })
        assertEquals("BARCODE-3", result[0].libraries[1].volumes.single().barCode)
        assertEquals("B", result[1].libraries.single().shorthand)
    }

    /** Creates valid source metadata for the planning fill-index boundary. */
    private fun volume(id: String, year: Int, ownerId: String, barcode: String) =
        StoredVolumeSnapshot(
            id = id,
            barcode = barcode,
            dateFrom = Instant.parse("1960-01-01T00:00:00Z"),
            dateTo = Instant.parse("1960-12-31T00:00:00Z"),
            metaTitleId = "title",
            metaTitleName = "Title",
            subName = null,
            mutationId = "mutation",
            mutationName = StoredLocalizedName("CS", "SK", "EN"),
            mutationMark = StoredMutationMark(null, "UNMARKED", null),
            owner = StoredOwner(ownerId, "Owner", ownerId, ownerId),
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
}
