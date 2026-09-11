package cz.incad.nkp.inprove.permonikexportapi.core

import cz.incad.nkp.inprove.permonikexportapi.calculation.CalculationWarningCode
import cz.incad.nkp.inprove.permonikexportapi.calculation.IssueSelection
import cz.incad.nkp.inprove.permonikexportapi.calculation.SpecimenMatchingRules
import io.grpc.Status
import io.grpc.StatusRuntimeException
import java.time.Instant
import java.time.LocalDate
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.Mockito.doReturn
import org.mockito.Mockito.doThrow
import org.mockito.Mockito.mock

class VolumeCalculationServiceTest {
    private val core = mock(CoreVolumeClient::class.java)
    private val service = VolumeCalculationService(core)
    private val issues = IssueSelection(true, false, false, true, false, false)
    private val rules = SpecimenMatchingRules(false, false, false)

    /** Ranks real candidate contents after prior sources and excludes already selected IDs. */
    @Test
    fun ranksCandidatesByTheirAdditionalCoverage() {
        val primary = volume("primary").let {
            it.copy(specimens = listOf(it.specimens.single().copy(missingPages = listOf(1, 2))))
        }
        val selected = volume("selected").let {
            it.copy(specimens = listOf(it.specimens.single().copy(missingPages = listOf(2))))
        }
        val redundant = selected.copy(id = "redundant")
        val useful = volume("useful")
        doReturn(listOf(primary, selected)).`when`(core).batchGetVolumeContents(listOf("primary", "selected"))
        doReturn(listOf("selected", "redundant", "useful")).`when`(core).searchReplacementVolumeIds("primary", rules)
        doReturn(listOf(redundant, useful)).`when`(core).batchGetVolumeContents(listOf("redundant", "useful"))

        val candidates = service.findReplacementCandidates("primary", listOf("selected"), issues, rules)

        assertEquals(listOf("useful", "redundant"), candidates.map { it.volumeId })
        assertEquals(listOf(1, 0), candidates.map { it.coveredRequiredUnits })
        assertEquals(100999, candidates.first().dependentFillIndex)
    }

    /** Uses source priority across batches while retaining source dates, raw flags and data warnings. */
    @Test
    fun calculatesRecordedStateFromPrioritizedBatches() {
        val primary = volume("primary").let {
            it.copy(specimens = listOf(it.specimens.single().copy(
                numExists = false,
                numMissing = true,
                damageTypes = listOf("UnknownDamage"),
            )))
        }
        val ids = listOf(primary.id) + (1..20).map { "source-$it" }
        val sources = ids.drop(1).map(::volume)
        val preferred = sources.first().let {
            it.copy(specimens = listOf(it.specimens.single().copy(damageTypes = listOf("ChDatum"))))
        }
        doReturn(listOf(primary, preferred) + sources.drop(1).take(18))
            .`when`(core).batchGetVolumeContents(ids.take(20))
        doReturn(listOf(sources.last())).`when`(core).batchGetVolumeContents(ids.drop(20))

        val result = service.calculate(primary.id, ids.drop(1), issues, rules)

        assertEquals(100998, result.fillIndex.value)
        assertEquals(0, result.remainingUnits)
        assertEquals(LocalDate.of(2025, 1, 1), result.snapshot.specimens.single().publicationDate)
        assertEquals(setOf("ChDatum"), result.snapshot.specimens.single().damageTypes)
        assertTrue(result.warnings.any { it.code == CalculationWarningCode.UNKNOWN_DAMAGE_TYPE })
        assertEquals(false, primary.specimens.single().numExists)
        assertEquals(true, primary.specimens.single().numMissing)
    }

    /** Rejects unsupported matching data and propagates unavailable source reads instead of calculating partial results. */
    @Test
    fun refusesInvalidOrUnavailableSourceData() {
        val primary = volume("primary")
        doReturn(listOf(primary.copy(mutationMark = StoredMutationMark(null, "UNKNOWN", null))))
            .`when`(core).batchGetVolumeContents(listOf(primary.id))
        assertThrows(IllegalArgumentException::class.java) {
            service.calculate(primary.id, emptyList(), issues, rules)
        }

        doThrow(Status.UNAVAILABLE.asRuntimeException()).`when`(core).batchGetVolumeContents(listOf(primary.id))
        val failure = assertThrows(StatusRuntimeException::class.java) {
            service.calculate(primary.id, emptyList(), issues, rules)
        }
        assertEquals(Status.Code.UNAVAILABLE, failure.status.code)
    }

    /** Supplies realistic stored metadata with a publication instant near the UTC day boundary. */
    private fun volume(id: String): StoredVolumeSnapshot {
        val mark = StoredMutationMark(null, "UNMARKED", null)
        return StoredVolumeSnapshot(
            id = id,
            barcode = id,
            dateFrom = Instant.parse("2025-01-01T00:00:00Z"),
            dateTo = Instant.parse("2025-12-31T00:00:00Z"),
            metaTitleId = "title",
            metaTitleName = "Title",
            subName = null,
            mutationId = "mutation",
            mutationName = StoredLocalizedName("Mutation", "Mutation", "Mutation"),
            mutationMark = mark,
            owner = StoredOwner("owner", "Owner", "O", "SIG"),
            signature = null,
            year = 2025,
            firstNumber = 1,
            lastNumber = 1,
            note = null,
            attachmentsSort = "NONE",
            periodicity = emptyList(),
            created = Instant.EPOCH,
            createdBy = "test",
            updated = null,
            updatedBy = null,
            specimens = listOf(StoredSpecimenSnapshot(
                id = "$id-specimen",
                publicationDate = Instant.parse("2025-01-01T23:30:00Z"),
                isAttachment = false,
                number = "1",
                attachmentNumber = null,
                editionId = "edition",
                mutationId = "mutation",
                mutationMark = mark,
                name = null,
                subName = null,
                numExists = true,
                numMissing = false,
                pagesCount = 4,
                missingPages = emptyList(),
                damagedPages = emptyList(),
                damageTypes = emptyList(),
            )),
        )
    }
}
