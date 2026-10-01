package cz.incad.nkp.inprove.permonikexportapi.template

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import com.fasterxml.jackson.annotation.JsonValue
import jakarta.validation.Valid
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import java.time.Instant

data class Template(
    val id: String,
    val version: Long? = null,
    val state: TemplateState,
    @field:Valid val primaryVolume: Volume,
    @field:Valid val replacementSourcesParameters: ReplacementSourcesParameters,
    @field:Min(0) @field:Max(100999) val primaryVolumeFillIndex: Int,
    @field:Min(0) @field:Max(100999) val combinedFillIndex: Int,
    @field:Valid val items: List<TemplateItem>,
    val createdDate: Instant,
    val modifiedDate: Instant,
)

enum class TemplateState {
    CREATED,
    WAITING_FOR_RESCAN,
    FINALIZED,
    LATE_FIXES,
}

data class TemplateItem(
    @field:Valid val specimen: TemplateSpecimen,
    @field:Valid val mainScan: MainScan,
    @field:Valid val pageReplacements: List<Replacement>,
    @get:JsonInclude(JsonInclude.Include.NON_NULL) val note: String? = null,
)

data class TemplateSpecimen(
    @field:NotBlank val id: String,
    val number: String? = null,
    val attachmentNumber: String? = null,
    val publicationDate: String,
    @field:Valid val mutationMark: MutationMark,
    @get:JsonProperty("isAttachment") @param:JsonProperty("isAttachment") val isAttachment: Boolean,
    val numExists: Boolean,
    val numMissing: Boolean,
)

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes(
    JsonSubTypes.Type(value = PrimaryMainScan::class, name = "PRIMARY"),
    JsonSubTypes.Type(value = ReplacementMainScan::class, name = "REPLACEMENT"),
)
sealed interface MainScan {
    val locked: Boolean
    val visible: Boolean
}

@JsonTypeName("PRIMARY")
data class PrimaryMainScan(
    override val locked: Boolean,
    override val visible: Boolean = true,
) : MainScan

@JsonTypeName("REPLACEMENT")
data class ReplacementMainScan(
    override val locked: Boolean,
    override val visible: Boolean = true,
    @field:Valid val replacement: MainReplacement,
) : MainScan

data class MainReplacement(
    @field:Valid val volume: ReplacementSource,
    val pages: List<Int> = emptyList(),
    val status: ReplacementStatus,
)

data class Replacement(
    @field:Valid val volume: ReplacementSource,
    val pages: List<Int>,
    val status: ReplacementStatus,
    val locked: Boolean,
    val visible: Boolean = true,
)

data class ReplacementSource(
    val volumeId: String? = null,
    val priority: Int? = null,
    @field:Min(0) @field:Max(100999) val dependentFillIndex: Int? = null,
    val signature: String? = null,
    val owner: String? = null,
    val barcode: String? = null,
    val mutation: String? = null,
    val mutationEdition: String? = null,
)

enum class ReplacementStatus {
    UNRESOLVED,
    ASSIGNED,
    UNREPLACEABLE,
    WAITING_FOR_RESCAN,
}

data class ReplacementSourcesParameters(
    val metatitle: Boolean,
    val mutation: Boolean,
    val mutationalEdition: Boolean,
    val owner: Boolean,
    val timeOverlap: Boolean,
)

data class ScanTemplateSettings(
    @field:Valid val issues: TemplateIssues,
    @field:Valid val replacementSourcesParameters: ReplacementSourcesParameters,
    @field:Valid val replacementSources: List<ReplacementSource>,
    @field:Min(0) @field:Max(100999) val primaryVolumeFillIndex: Int,
    val version: Long? = null,
)

data class TemplateVersion(val version: Long)

data class TemplateTransition(
    val targetState: TemplateState,
    val version: Long,
    @field:Valid val changes: Template? = null,
)

data class ReplacementCandidateQuery(
    @field:Valid val issues: TemplateIssues,
    @field:Valid val replacementSourcesParameters: ReplacementSourcesParameters,
    @field:Valid val replacementSources: List<ReplacementSource>,
)

data class FillIndexQuery(
    @field:Valid val issues: TemplateIssues,
    val replacementSourcesIds: List<String>,
)

data class TemplateIssues(
    val missingPages: Boolean,
    val damagedPages: Boolean,
    val illegiblyBound: Boolean,
    val missingSpecimen: Boolean,
    val censored: Boolean,
    val degradation: Boolean,
)

data class Volume(
    val id: String,
    val barCode: String,
    val dateFrom: String,
    val dateTo: String,
    val metaTitleId: String,
    val metaTitleName: String,
    val subName: String?,
    val mutationId: String,
    val mutationName: String,
    @field:Valid val periodicity: List<VolumePeriodicity>,
    val firstNumber: Int,
    val lastNumber: Int,
    val note: String?,
    val attachmentsSort: VolumeAttachmentsSort,
    val signature: String?,
    val ownerId: String,
    val ownerName: String,
    val year: Int,
    @field:Valid val mutationMark: MutationMark,
    val created: String,
    val createdBy: String,
    val updated: String? = null,
    val updatedBy: String? = null,
    val deleted: String? = null,
    val deletedBy: String? = null,
)

data class VolumePeriodicity(
    val numExists: Boolean,
    @get:JsonProperty("isAttachment") @param:JsonProperty("isAttachment") val isAttachment: Boolean,
    val editionId: String,
    val day: VolumePeriodicityDay,
    val pagesCount: Int,
    val name: String,
    val subName: String,
)

enum class VolumePeriodicityDay(@get:JsonValue val value: String) {
    MONDAY("Monday"),
    TUESDAY("Tuesday"),
    WEDNESDAY("Wednesday"),
    THURSDAY("Thursday"),
    FRIDAY("Friday"),
    SATURDAY("Saturday"),
    SUNDAY("Sunday");

    companion object {
        /** Parses the title-cased weekday representation used by the frontend volume schema. */
        @JvmStatic
        @JsonCreator
        fun fromValue(value: String) =
            entries.firstOrNull { it.value == value }
                ?: throw IllegalArgumentException("Unknown volume periodicity day: $value")
    }
}

enum class VolumeAttachmentsSort {
    ASC,
    DESC,
    NONE,
}

data class Mutation(
    val id: String,
    val name: LocalizedName,
    val created: String,
    val createdBy: String,
    val updated: String? = null,
    val updatedBy: String? = null,
    val deleted: String? = null,
    val deletedBy: String? = null,
)

data class LocalizedName(val cs: String, val sk: String, val en: String)

data class MutationMark(
    val mark: String? = null,
    val type: MutationMarkType,
    val description: String? = null,
)

enum class MutationMarkType {
    MARK,
    NUMBER,
    UNMARKED,
}
