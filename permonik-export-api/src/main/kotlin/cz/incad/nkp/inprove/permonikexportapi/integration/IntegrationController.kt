package cz.incad.nkp.inprove.permonikexportapi.integration

import jakarta.validation.constraints.NotBlank
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@Validated
@RestController
@RequestMapping("/api/integration/volume/template")
class IntegrationController(private val templates: IntegrationTemplateService) {
    /** Serves the public simplified view of a finalized template selected by volume barcode. */
    @GetMapping fun get(@RequestParam @NotBlank barcode: String) = templates.getByBarcode(barcode)
}
