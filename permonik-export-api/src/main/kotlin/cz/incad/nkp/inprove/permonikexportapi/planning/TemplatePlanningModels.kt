package cz.incad.nkp.inprove.permonikexportapi.planning

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import cz.incad.nkp.inprove.permonikexportapi.template.MutationMarkType
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank

data class TemplatePlanningQuery(
    @field:NotBlank val metaTitleId: String,
    val yearFrom: String,
    val yearTo: String,
    @field:Valid val mutation: MutationFilter? = null,
    @field:Valid val mutationalEdition: MutationalEditionFilter,
)

/** Selects a stored mutation by ID; frontend labels and audit fields are not search criteria. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class MutationFilter(@field:NotBlank val id: String)

/** Optional search criteria, not a stored mutation mark whose type is required by Solr. */
data class MutationalEditionFilter(
    val mark: String? = null,
    val type: MutationMarkType? = null,
    val description: String? = null,
)

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
)
