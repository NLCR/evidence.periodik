package cz.incad.nkp.inprove.permonikexportapi.template.persistence

import cz.incad.nkp.inprove.permonikexportapi.template.Template

/**
 * Converts a fully persisted aggregate to the HTTP model after auditing and versioning are
 * complete.
 */
fun StoredTemplate.toHttpTemplate(): Template {
    val persistedVersion = requireNotNull(version) { "Stored template version is missing" }
    val persistedCreatedDate =
        requireNotNull(createdDate) { "Stored template creation date is missing" }
    val persistedModifiedDate =
        requireNotNull(modifiedDate) { "Stored template modification date is missing" }
    return Template(
        id = id.toString(),
        version = persistedVersion,
        state = state,
        primaryVolume = content.primaryVolume,
        replacementSourcesParameters = content.replacementSourcesParameters,
        primaryVolumeFillIndex = content.primaryVolumeFillIndex,
        combinedFillIndex = content.combinedFillIndex,
        items = content.items,
        createdDate = persistedCreatedDate,
        modifiedDate = persistedModifiedDate,
    )
}
