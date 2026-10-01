package cz.incad.nkp.inprove.permonikexportapi.planning

import jakarta.validation.Valid
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/export/template-planning")
class TemplatePlanningController(private val templates: TemplatePlanningService) {
    /**
     * Returns the cross-owner digitalization plan for the supplied title, years, and mutation
     * filters.
     */
    @PostMapping("/query")
    fun query(@Valid @RequestBody query: TemplatePlanningQuery) = templates.plan(query)
}
