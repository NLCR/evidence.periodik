package cz.incad.nkp.inprove.permonikexportapi.planning

import cz.incad.nkp.inprove.permonikexportapi.core.CoreVolumeClient
import io.grpc.Status
import io.grpc.StatusRuntimeException
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/export/template-planning")
class TemplatePlanningController(
    private val templates: TemplatePlanningService,
    private val core: CoreVolumeClient,
) {
    /**
     * Returns the cross-owner digitalization plan for the supplied title, years, and mutation
     * filters.
     */
    @PostMapping("/query")
    fun query(@Valid @RequestBody query: TemplatePlanningQuery) = templates.plan(query)

    /** Returns candidate counts for each facet under the opposite selection. */
    @PostMapping("/facets")
    fun facets(@Valid @RequestBody query: TemplatePlanningQuery) = core.queryPlanningFacets(query)

    /**
     * Identifies planning timeouts for the UI without replacing the original diagnostic message.
     */
    @ExceptionHandler(StatusRuntimeException::class)
    fun grpcFailure(exception: StatusRuntimeException): ResponseEntity<Map<String, Any>> {
        if (exception.status.code != Status.Code.DEADLINE_EXCEEDED) throw exception
        return ResponseEntity.internalServerError()
            .body(
                mapOf(
                    "status" to HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "code" to "PLANNING_TIMEOUT",
                    "message" to exception.message.orEmpty(),
                )
            )
    }
}
