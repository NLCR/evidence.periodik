package cz.incad.nkp.inprove.permonikexportapi

import cz.incad.nkp.inprove.permonikexportapi.config.ApiExceptionHandler
import cz.incad.nkp.inprove.permonikexportapi.config.InternalJwtProperties
import cz.incad.nkp.inprove.permonikexportapi.config.SecurityConfiguration
import cz.incad.nkp.inprove.permonikexportapi.integration.IntegrationController
import cz.incad.nkp.inprove.permonikexportapi.planning.TemplatePlanningController
import cz.incad.nkp.inprove.permonikexportapi.template.MockTemplateService
import cz.incad.nkp.inprove.permonikexportapi.template.ReplacementSourcesParameters
import cz.incad.nkp.inprove.permonikexportapi.template.ScanTemplateSettings
import cz.incad.nkp.inprove.permonikexportapi.template.TemplateController
import cz.incad.nkp.inprove.permonikexportapi.template.TemplateIssues
import cz.incad.nkp.inprove.permonikexportapi.template.TemplateState
import cz.incad.nkp.inprove.permonikexportapi.template.TemplateTransition
import java.util.UUID
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

@WebMvcTest(
    controllers = [TemplateController::class, TemplatePlanningController::class, IntegrationController::class],
    properties = ["permonik.security.internal-jwt.secret=test-secret-with-at-least-thirty-two-bytes"],
)
@Import(SecurityConfiguration::class, MockTemplateService::class, ApiExceptionHandler::class)
@EnableConfigurationProperties(InternalJwtProperties::class)
class MockExportApiContractTest @Autowired constructor(
    private val mvc: MockMvc,
    private val templates: MockTemplateService,
) {
    /** Requires the single export permission; a login or role claim alone does not grant export access. */
    @Test
    fun exportRequiresManagePermission() {
        val volumeId = UUID.randomUUID().toString()
        mvc.get("/api/export/volume/$volumeId/template").andExpect { status { isUnauthorized() } }
        mvc.post("/api/export/volume/$volumeId/template/generate") {
            with(jwt().authorities(SimpleGrantedAuthority("ROLE_USER")))
            contentType = MediaType.APPLICATION_JSON
            content = generateBody
        }.andExpect { status { isForbidden() } }
    }

    /** Verifies the editable template lifecycle and its discriminated frontend JSON representation. */
    @Test
    fun templateLifecycleUsesFrontendJsonShape() {
        val volumeId = UUID.randomUUID().toString()

        mvc.post("/api/export/volume/{volumeId}/template/generate", volumeId) {
            with(jwt().authorities(SimpleGrantedAuthority("TEMPLATE_MANAGE")))
            contentType = MediaType.APPLICATION_JSON
            content = generateBody
        }.andExpect {
            status { isOk() }
            jsonPath("\$.version") { value(0) }
            jsonPath("\$.state") { value("CREATED") }
            jsonPath("\$.primaryVolume.id") { value(volumeId) }
            jsonPath("\$.primaryVolume.dateFrom") { isString() }
            jsonPath("\$.items[0].mainScan.type") { value("PRIMARY") }
            jsonPath("\$.items[0].specimen.isAttachment") { value(false) }
            jsonPath("\$.items[0].specimen.attachment") { doesNotExist() }
            jsonPath("\$.items[0].note") { doesNotExist() }
        }

        mvc.post("/api/export/volume/{volumeId}/template/transition", volumeId) {
            with(jwt().authorities(SimpleGrantedAuthority("TEMPLATE_MANAGE")))
            contentType = MediaType.APPLICATION_JSON
            content = """{"targetState":"FINALIZED","version":0,"changes":null}"""
        }.andExpect {
            status { isOk() }
            jsonPath("\$.version") { value(1) }
            jsonPath("\$.state") { value("FINALIZED") }
            jsonPath("\$.items[0].mainScan.locked") { value(true) }
        }
    }

    /** Verifies that a finalized template is available through the unauthenticated integration endpoint. */
    @Test
    fun finalizedTemplateIsPubliclyAvailableByBarcode() {
        val volumeId = UUID.randomUUID().toString()
        val template = templates.generate(volumeId, settings())
        templates.transition(volumeId, TemplateTransition(TemplateState.FINALIZED, requireNotNull(template.version)))

        mvc.get("/api/integration/volume/template") {
            param("barcode", template.primaryVolume.barCode)
        }.andExpect {
            status { isOk() }
            jsonPath("\$.barcode") { value(template.primaryVolume.barCode) }
            jsonPath("\$.specimenCount") { value(1) }
            jsonPath("\$.specimen[0].isAttachment") { value(false) }
            jsonPath("\$.state") { doesNotExist() }
        }
    }

    /** Verifies the year, library, and volume grouping expected by the planning frontend. */
    @Test
    fun planningResponseMatchesFrontendGrouping() {
        mvc.post("/api/export/template-planning/query") {
            with(jwt().authorities(SimpleGrantedAuthority("TEMPLATE_MANAGE")))
            contentType = MediaType.APPLICATION_JSON
            content = """
                {
                  "metaTitleId": "mock-metatitle",
                  "yearFrom": "2025",
                  "yearTo": "2025",
                  "mutation": null,
                  "mutationalEdition": {"mark": null, "type": null, "description": null}
                }
            """.trimIndent()
        }.andExpect {
            status { isOk() }
            jsonPath("\$[0].year") { value("2025") }
            jsonPath("\$[0].libraries[0].id") { value("mock-library") }
            jsonPath("\$[0].libraries[0].volumes[0].fillIndex") { value(85000) }
        }
    }

    /** Creates valid default generation settings for direct mock-service setup in HTTP tests. */
    private fun settings() = ScanTemplateSettings(
        issues = TemplateIssues(false, false, false, false, false, false),
        replacementSourcesParameters = ReplacementSourcesParameters(true, false, false, false, true),
        replacementSources = emptyList(),
        primaryVolumeFillIndex = 0,
    )
}

private val generateBody = """
    {
      "issues": {
        "missingPages": false,
        "damagedPages": false,
        "illegiblyBound": false,
        "missingSpecimen": false,
        "censored": false,
        "degradation": false
      },
      "replacementSourcesParameters": {
        "metatitle": true,
        "mutation": false,
        "mutationalEdition": false,
        "owner": false,
        "timeOverlap": true
      },
      "replacementSources": [],
      "primaryVolumeFillIndex": 0,
      "version": null
    }
""".trimIndent()
