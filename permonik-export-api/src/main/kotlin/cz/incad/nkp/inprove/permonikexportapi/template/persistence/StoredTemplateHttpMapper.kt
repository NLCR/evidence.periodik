package cz.incad.nkp.inprove.permonikexportapi.template.persistence

import cz.incad.nkp.inprove.permonikexportapi.template.Replacement
import cz.incad.nkp.inprove.permonikexportapi.template.Template
import cz.incad.nkp.inprove.permonikexportapi.template.TemplateItem

/**
 * Converts a fully persisted aggregate to the HTTP model after auditing and versioning are
 * complete.
 */
fun StoredTemplate.toHttpTemplate(): Template {
    val persistedId = requireNotNull(id) { "Stored template ID is missing" }
    val persistedVersion = requireNotNull(version) { "Stored template version is missing" }
    val persistedCreatedDate =
        requireNotNull(createdDate) { "Stored template creation date is missing" }
    val persistedModifiedDate =
        requireNotNull(modifiedDate) { "Stored template modification date is missing" }
    return Template(
        id = persistedId.toString(),
        version = persistedVersion,
        state = state,
        primaryVolume = content.primaryVolume,
        replacementSourcesParameters = content.replacementSourcesParameters,
        primaryVolumeFillIndex = content.primaryVolumeFillIndex,
        combinedFillIndex = content.combinedFillIndex,
        items =
            content.items
                .map { item ->
                    item.copy(
                        pageReplacements = item.pageReplacements.sortedWith(compareReplacementOrder)
                    )
                }
                .sortedWith(compareTemplateItemOrder),
        createdDate = persistedCreatedDate,
        modifiedDate = persistedModifiedDate,
    )
}

/**
 * Keeps responses for existing templates in the same chronological order as newly generated ones.
 */
private val compareTemplateItemOrder =
    compareBy<TemplateItem> { it.specimen.publicationDate }
        .thenBy { it.specimen.isAttachment }
        .thenBy { it.specimen.number ?: "" }
        .thenBy { it.specimen.attachmentNumber ?: "" }
        .thenBy { it.specimen.id }

/** Groups page replacement rows by source priority in responses for existing templates. */
private val compareReplacementOrder =
    compareBy<Replacement> { it.volume.priority ?: Int.MAX_VALUE }
        .thenBy { it.pages.firstOrNull() ?: Int.MAX_VALUE }
