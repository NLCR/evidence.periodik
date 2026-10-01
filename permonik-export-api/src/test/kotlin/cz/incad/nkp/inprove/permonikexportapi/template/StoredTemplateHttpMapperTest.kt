package cz.incad.nkp.inprove.permonikexportapi.template

import cz.incad.nkp.inprove.permonikexportapi.template.persistence.StoredTemplate
import cz.incad.nkp.inprove.permonikexportapi.template.persistence.TemplateContent
import cz.incad.nkp.inprove.permonikexportapi.template.persistence.toHttpTemplate
import java.time.Instant
import java.util.UUID
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test

class StoredTemplateHttpMapperTest {
    /**
     * Verifies that persisted identity, version and audit surround the JSON content in the HTTP
     * model.
     */
    @Test
    fun mapsPersistedAggregateToHttpTemplate() {
        val created = Instant.parse("2025-01-01T00:00:00Z")
        val modified = Instant.parse("2025-01-02T00:00:00Z")
        val aggregate = storedTemplate(version = 4, createdDate = created, modifiedDate = modified)

        val result = aggregate.toHttpTemplate()

        assertEquals("4", result.version.toString())
        assertEquals(aggregate.id.toString(), result.id)
        assertEquals(created, result.createdDate)
        assertEquals(modified, result.modifiedDate)
        assertEquals("BARCODE", result.primaryVolume.barCode)
    }

    /**
     * Verifies that an aggregate cannot be exposed before Spring Data auditing and versioning
     * complete.
     */
    @Test
    fun rejectsUnsavedAggregate() {
        assertThrows(IllegalArgumentException::class.java) {
            storedTemplate().toHttpTemplate()
        }
    }

    /** Creates a minimal persisted aggregate for HTTP mapping tests. */
    private fun storedTemplate(
        version: Long? = null,
        createdDate: Instant? = null,
        modifiedDate: Instant? = null,
    ) =
        StoredTemplate(
            id = UUID.randomUUID(),
            primaryVolumeId = "volume",
            ownerId = "owner",
            version = version,
            state = TemplateState.CREATED,
            content =
                TemplateContent(
                    primaryVolume =
                        Volume(
                            id = "volume",
                            barCode = "BARCODE",
                            dateFrom = "2025-01-01T00:00:00Z",
                            dateTo = "2025-12-31T00:00:00Z",
                            metaTitleId = "meta",
                            metaTitleName = "Meta title",
                            subName = null,
                            mutationId = "mutation",
                            mutationName = "Mutation",
                            periodicity = emptyList(),
                            firstNumber = 1,
                            lastNumber = 2,
                            note = null,
                            attachmentsSort = VolumeAttachmentsSort.NONE,
                            signature = null,
                            ownerId = "owner",
                            ownerName = "Owner",
                            year = 2025,
                            mutationMark = MutationMark(type = MutationMarkType.UNMARKED),
                            created = "2025-01-01T00:00:00Z",
                            createdBy = "source-user",
                        ),
                    primaryOwnerSigla = "OWNER",
                    replacementSourcesParameters =
                        ReplacementSourcesParameters(
                            metatitle = true,
                            mutation = false,
                            mutationalEdition = false,
                            owner = false,
                            timeOverlap = true
                        ),
                    primaryVolumeFillIndex = 0,
                    combinedFillIndex = 0,
                    items = emptyList(),
                    issues = TemplateIssues(
                        missingPages = false,
                        damagedPages = false,
                        illegiblyBound = false,
                        missingSpecimen = false,
                        censored = false,
                        degradation = false
                    ),
                    replacementSources = emptyList(),
                ),
            createdDate = createdDate,
            createdBy = "user",
            modifiedDate = modifiedDate,
            modifiedBy = "user",
        )
}
