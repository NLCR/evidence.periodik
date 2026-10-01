package cz.incad.nkp.inprove.permonikexportapi.core

import java.time.Instant

/**
 * Stored source data, not a certified theoretical ideal list. No transport or framework
 * dependencies.
 */
data class StoredVolumeSnapshot(
    val id: String,
    val barcode: String,
    val dateFrom: Instant,
    val dateTo: Instant,
    val metaTitleId: String,
    val metaTitleName: String,
    val subName: String?,
    val mutationId: String,
    val mutationName: StoredLocalizedName,
    val mutationMark: StoredMutationMark,
    val owner: StoredOwner,
    val signature: String?,
    val year: Int,
    val firstNumber: Int,
    val lastNumber: Int,
    val note: String?,
    val attachmentsSort: String,
    val periodicity: List<StoredPeriodicityItem>,
    val created: Instant,
    val createdBy: String,
    val updated: Instant?,
    val updatedBy: String?,
    val specimens: List<StoredSpecimenSnapshot>,
)

data class StoredSpecimenSnapshot(
    val id: String,
    val publicationDate: Instant,
    val isAttachment: Boolean,
    val number: String?,
    val attachmentNumber: String?,
    val editionId: String,
    val mutationId: String,
    val mutationMark: StoredMutationMark,
    val name: String?,
    val subName: String?,
    val numExists: Boolean,
    val numMissing: Boolean,
    val pagesCount: Int,
    val missingPages: List<Int>,
    val damagedPages: List<Int>,
    val damageTypes: List<String>,
)

data class StoredOwner(val id: String, val name: String, val shorthand: String, val sigla: String)

data class StoredLocalizedName(val cs: String, val sk: String, val en: String)

data class StoredMutationMark(val mark: String?, val type: String, val description: String?)

data class StoredPeriodicityItem(
    val day: String,
    val numExists: Boolean,
    val editionId: String,
    val pagesCount: Int,
    val name: String,
    val subName: String,
    val isAttachment: Boolean,
)
