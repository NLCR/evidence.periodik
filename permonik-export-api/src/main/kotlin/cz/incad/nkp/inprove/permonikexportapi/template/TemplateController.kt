package cz.incad.nkp.inprove.permonikexportapi.template

import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/export/volume/{volumeId}/template")
class TemplateController(private val templates: TemplateService) {
    /** Serves the active template for a primary volume. */
    @GetMapping fun get(@PathVariable volumeId: String) = templates.get(volumeId)

    /** Creates or regenerates a template from the current frontend settings. */
    @PostMapping("/generate")
    fun generate(
        @PathVariable volumeId: String,
        @Valid @RequestBody settings: ScanTemplateSettings,
    ) = templates.generate(volumeId, settings)

    /** Persists editable template content and returns the new optimistic-lock version. */
    @PutMapping
    fun save(
        @PathVariable volumeId: String,
        @Valid @RequestBody template: Template,
    ) = templates.save(volumeId, template)

    /** Applies optional edits and performs a validated state transition atomically. */
    @PostMapping("/transition")
    fun transition(
        @PathVariable volumeId: String,
        @Valid @RequestBody transition: TemplateTransition,
    ) = templates.transition(volumeId, transition)

    /** Rebuilds unlocked assignments without changing locked user decisions. */
    @PostMapping("/synchronize")
    fun synchronize(
        @PathVariable volumeId: String,
        @Valid @RequestBody version: TemplateVersion,
    ) = templates.synchronize(volumeId, version.version)

    /** Soft-deletes the active template for the primary volume. */
    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable volumeId: String) = templates.delete(volumeId)

    /** Returns possible replacement sources ordered after the already selected sources. */
    @PostMapping("/replacement-candidates")
    fun replacementCandidates(
        @PathVariable volumeId: String,
        @Valid @RequestBody query: ReplacementCandidateQuery,
    ) = templates.replacementCandidates(volumeId, query)

    /** Returns the fill index produced by applying selected replacement volumes. */
    @PostMapping("/fill-index")
    fun fillIndex(
        @PathVariable volumeId: String,
        @Valid @RequestBody query: FillIndexQuery,
    ) = templates.fillIndex(volumeId, query)
}
