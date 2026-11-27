package cz.incad.nkp.inprove.permonikexportapi.integration

import cz.incad.nkp.inprove.permonikexportapi.template.MutationMark
import cz.incad.nkp.inprove.permonikexportapi.template.MutationMarkType
import cz.incad.nkp.inprove.permonikexportapi.template.PrimaryMainScan
import cz.incad.nkp.inprove.permonikexportapi.template.ReplacementSourcesParameters
import cz.incad.nkp.inprove.permonikexportapi.template.TemplateIssues
import cz.incad.nkp.inprove.permonikexportapi.template.TemplateItem
import cz.incad.nkp.inprove.permonikexportapi.template.TemplateSpecimen
import cz.incad.nkp.inprove.permonikexportapi.template.TemplateState
import cz.incad.nkp.inprove.permonikexportapi.template.Volume
import cz.incad.nkp.inprove.permonikexportapi.template.VolumeAttachmentsSort
import cz.incad.nkp.inprove.permonikexportapi.template.persistence.StoredTemplate
import cz.incad.nkp.inprove.permonikexportapi.template.persistence.StoredTemplateRepository
import cz.incad.nkp.inprove.permonikexportapi.template.persistence.TemplateContent
import java.util.UUID
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.mockito.Mockito.doReturn
import org.mockito.Mockito.mock

class StoredIntegrationTemplateServiceTest {
    private val repository = mock(StoredTemplateRepository::class.java)
    private val service = StoredIntegrationTemplateService(repository)

    /** Verifies that a finalized stored template is reduced to the public integration contract. */
    @Test
    fun returnsPublicProjectionByBarcode() {
        val template = storedTemplate()
        doReturn(template).`when`(repository).findActiveFinalizedByBarcode("BARCODE")

        val result = service.getByBarcode("BARCODE")

        assertEquals("BARCODE", result.barcode)
        assertEquals(1, result.specimenCount)
        assertEquals("1", result.specimen.single().number)
        assertEquals("LIB", result.specimen.single().volume.ownerSigla)
        assertEquals("SIG", result.specimen.single().volume.signature)
    }

    /** Verifies that missing or non-finalized templates do not leak through the public endpoint. */
    @Test
    fun rejectsMissingFinalizedTemplate() {
        doReturn(null).`when`(repository).findActiveFinalizedByBarcode("MISSING")

        assertThrows(RuntimeException::class.java) { service.getByBarcode("MISSING") }
    }

    /**
     * Creates one finalized stored template with only the fields relevant to the public projection.
     */
    private fun storedTemplate() =
        StoredTemplate(
            id = UUID.randomUUID(),
            primaryVolumeId = "volume",
            ownerId = "owner",
            version = 1,
            state = TemplateState.FINALIZED,
            content =
                TemplateContent(
                    primaryVolume =
                        Volume(
                            id = "volume",
                            barCode = "BARCODE",
                            dateFrom = "2025-01-01",
                            dateTo = "2025-12-31",
                            metaTitleId = "meta",
                            metaTitleName = "Meta title",
                            subName = null,
                            mutationId = "mutation",
                            mutationName = "Mutation",
                            periodicity = emptyList(),
                            firstNumber = 1,
                            lastNumber = 1,
                            note = null,
                            attachmentsSort = VolumeAttachmentsSort.NONE,
                            signature = "SIG",
                            ownerId = "owner",
                            ownerName = "Owner",
                            year = 2025,
                            mutationMark = MutationMark(type = MutationMarkType.UNMARKED),
                            created = "2025-01-01",
                            createdBy = "user",
                        ),
                    primaryOwnerSigla = "LIB",
                    replacementSourcesParameters =
                        ReplacementSourcesParameters(
                            metatitle = true,
                            mutation = false,
                            mutationalEdition = false,
                            owner = false,
                            timeOverlap = true
                        ),
                    primaryVolumeFillIndex = 100000,
                    combinedFillIndex = 100000,
                    issues = TemplateIssues(
                        missingPages = false,
                        damagedPages = false,
                        illegiblyBound = false,
                        missingSpecimen = false,
                        censored = false,
                        degradation = false
                    ),
                    replacementSources = emptyList(),
                    items =
                        listOf(
                            TemplateItem(
                                specimen =
                                    TemplateSpecimen(
                                        id = "specimen",
                                        number = "1",
                                        publicationDate = "2025-01-01",
                                        mutationMark =
                                            MutationMark(type = MutationMarkType.UNMARKED),
                                        isAttachment = false,
                                        numExists = true,
                                        numMissing = false,
                                    ),
                                mainScan = PrimaryMainScan(locked = true),
                                pageReplacements = emptyList(),
                            )
                        ),
                ),
        )
}
