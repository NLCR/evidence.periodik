package cz.incad.nkp.inprove.permonikexportapi.integration

import cz.incad.nkp.inprove.permonikexportapi.template.FinalizedTemplateNotFoundException
import cz.incad.nkp.inprove.permonikexportapi.template.PrimaryMainScan
import cz.incad.nkp.inprove.permonikexportapi.template.ReplacementMainScan
import cz.incad.nkp.inprove.permonikexportapi.template.TemplateItem
import cz.incad.nkp.inprove.permonikexportapi.template.persistence.StoredTemplate
import cz.incad.nkp.inprove.permonikexportapi.template.persistence.StoredTemplateRepository
import org.springframework.context.annotation.Primary
import org.springframework.stereotype.Service

/** Serves the public integration projection from active finalized PostgreSQL templates. */
@Primary
@Service
class StoredIntegrationTemplateService(private val templates: StoredTemplateRepository) :
    IntegrationTemplateService {
    /** Returns only the intentionally reduced public view of the finalized template. */
    override fun getByBarcode(barcode: String): IntegrationTemplate =
        templates.findActiveFinalizedByBarcode(barcode)?.toIntegrationTemplate()
            ?: throw FinalizedTemplateNotFoundException(barcode)
}

/**
 * Converts a stored finalized template without exposing its state, version or internal identifiers.
 */
private fun StoredTemplate.toIntegrationTemplate(): IntegrationTemplate {
    val primary = content.primaryVolume
    return IntegrationTemplate(
        barcode = primary.barCode,
        specimenCount = content.items.size,
        specimen =
            content.items.map {
                it.toIntegrationSpecimen(content.primaryOwnerSigla, primary.signature)
            },
    )
}

/** Selects the replacement volume for one specimen and maps only public integration fields. */
private fun TemplateItem.toIntegrationSpecimen(
    primaryOwnerSigla: String,
    primarySignature: String?,
) =
    IntegrationSpecimen(
        number =
            if (specimen.isAttachment) {
                specimen.attachmentNumber.orEmpty()
            } else {
                specimen.number.orEmpty()
            },
        mutationMark =
            IntegrationMutationMark(
                specimen.mutationMark.mark.orEmpty(),
                specimen.mutationMark.type,
            ),
        isAttachment = specimen.isAttachment,
        volume =
            when (val scan = mainScan) {
                is PrimaryMainScan ->
                    IntegrationVolume(primarySignature.orEmpty(), primaryOwnerSigla)
                is ReplacementMainScan ->
                    IntegrationVolume(
                        scan.replacement.volume.signature.orEmpty(),
                        scan.replacement.volume.owner.orEmpty(),
                    )
            },
    )
