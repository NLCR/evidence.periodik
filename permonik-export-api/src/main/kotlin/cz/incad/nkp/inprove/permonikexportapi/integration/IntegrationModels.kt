package cz.incad.nkp.inprove.permonikexportapi.integration

import com.fasterxml.jackson.annotation.JsonProperty
import cz.incad.nkp.inprove.permonikexportapi.template.MutationMarkType

data class IntegrationTemplate(
    val barcode: String,
    val specimenCount: Int,
    val specimen: List<IntegrationSpecimen>,
)

data class IntegrationSpecimen(
    val number: String,
    val mutationMark: IntegrationMutationMark,
    @get:JsonProperty("isAttachment") @param:JsonProperty("isAttachment") val isAttachment: Boolean,
    val volume: IntegrationVolume,
)

data class IntegrationMutationMark(
    val mark: String,
    val type: MutationMarkType,
)

data class IntegrationVolume(
    val signature: String,
    val ownerSigla: String,
)
