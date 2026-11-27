package cz.incad.nkp.inprove.permonikexportapi.planning

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import cz.incad.nkp.inprove.permonikexportapi.template.LocalizedName
import cz.incad.nkp.inprove.permonikexportapi.template.MutationMark
import cz.incad.nkp.inprove.permonikexportapi.template.MutationMarkType
import jakarta.validation.Valid
import jakarta.validation.constraints.AssertTrue
import jakarta.validation.constraints.NotBlank

data class TemplatePlanningQuery(
    @field:NotBlank val metaTitleId: String,
    val yearFrom: Int,
    val yearTo: Int,
    @field:Valid val mutation: MutationFilter? = null,
    @field:Valid val mutationalEdition: MutationalEditionFilter? = null,
) {
    @get:JsonIgnore
    @get:AssertTrue(message = "Planning years must be in 1–9999 and in ascending order")
    val isYearRangeValid: Boolean
        get() = yearFrom in 1..9999 && yearTo in yearFrom..9999
}

/** Selects a stored mutation by ID; frontend labels and audit fields are not search criteria. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class MutationFilter(@field:NotBlank val id: String)

/** Optional search criteria, not a stored mutation mark whose type is required by Solr. */
data class MutationalEditionFilter(
    val mark: String? = null,
    val type: MutationMarkType? = null,
    val description: String? = null,
) {
    @get:JsonIgnore
    @get:AssertTrue(message = "A mutational edition filter needs a mark or type UNMARKED")
    val isSelectionValid: Boolean
        get() = !mark.isNullOrBlank() || type == MutationMarkType.UNMARKED
}

data class PlanningFacets(
    val mutations: List<PlanningFacet<PlanningMutation>>,
    val mutationalEditions: List<PlanningFacet<MutationMark>>,
)

data class PlanningFacet<T>(val item: T, val count: Long)

data class PlanningMutation(val id: String, val name: LocalizedName)

typealias TemplatePlanning = List<TemplatePlanningYear>

data class TemplatePlanningYear(
    val year: String,
    val libraries: List<TemplatePlanningLibrary>,
)

data class TemplatePlanningLibrary(
    val id: String,
    val shorthand: String,
    val volumes: List<TemplatePlanningVolume>,
)

data class TemplatePlanningVolume(
    val id: String,
    val barCode: String,
    val fillIndex: Int,
    val monthFrom: Int,
    val monthTo: Int,
    val pagesCount: Long,
    val continuesFromPreviousYear: Boolean,
    val continuesIntoNextYear: Boolean,
)
