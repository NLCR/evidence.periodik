package cz.incad.nkp.inprove.permonikexportapi.planning

import cz.incad.nkp.inprove.permonikexportapi.core.CoreVolumeClient
import cz.incad.nkp.inprove.permonikexportapi.template.LocalizedName
import cz.incad.nkp.inprove.permonikexportapi.template.MutationMark
import cz.incad.nkp.inprove.permonikexportapi.template.MutationMarkType
import io.grpc.Status
import org.junit.jupiter.api.Test
import org.mockito.Mockito.doReturn
import org.mockito.Mockito.mock
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.MockMvcBuilders

class TemplatePlanningControllerTest {
    /** Both endpoints reject a missing, out-of-bounds, or reversed year range. */
    @Test
    fun rejectsInvalidYearsForResultsAndFacets() {
        val mvc =
            MockMvcBuilders.standaloneSetup(
                    TemplatePlanningController(
                        { error("Invalid range reached planning") },
                        mock(CoreVolumeClient::class.java),
                    )
                )
                .build()

        for (endpoint in listOf("query", "facets")) {
            for ((from, to) in listOf(null to 2000, 0 to 2000, 2000 to 1900, 1900 to 10000)) {
                mvc.perform(
                        post("/api/export/template-planning/$endpoint")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""{"metaTitleId":"title","yearFrom":$from,"yearTo":$to}""")
                    )
                    .andExpect(status().isBadRequest)
            }
        }
    }

    /** Rejects an empty edition filter instead of treating it as no selection. */
    @Test
    fun rejectsEmptyEditionFilter() {
        val mvc =
            MockMvcBuilders.standaloneSetup(
                    TemplatePlanningController(
                        { error("Empty edition filter reached planning") },
                        mock(CoreVolumeClient::class.java),
                    )
                )
                .build()

        mvc.perform(
                post("/api/export/template-planning/query")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """{"metaTitleId":"title","yearFrom":1900,"yearTo":2000,"mutationalEdition":{}}"""
                    )
            )
            .andExpect(status().isBadRequest)
    }

    /** Checks the HTTP facet shape consumed by both planning selects. */
    @Test
    fun returnsFacetItemsWithSeparateCounts() {
        val core = mock(CoreVolumeClient::class.java)
        val query = TemplatePlanningQuery("title", 1900, 2000)
        doReturn(
                PlanningFacets(
                    mutations =
                        listOf(
                            PlanningFacet(
                                PlanningMutation(
                                    "mutation",
                                    LocalizedName("Praha", "Praha", "Prague"),
                                ),
                                2,
                            )
                        ),
                    mutationalEditions =
                        listOf(PlanningFacet(MutationMark("***", MutationMarkType.MARK), 1)),
                )
            )
            .`when`(core)
            .queryPlanningFacets(query)
        val mvc =
            MockMvcBuilders.standaloneSetup(TemplatePlanningController({ emptyList() }, core))
                .build()

        mvc.perform(
                post("/api/export/template-planning/facets")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """{"metaTitleId":"title","yearFrom":1900,"yearTo":2000,"mutation":null,"mutationalEdition":null}"""
                    )
            )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.mutations[0].item.id").value("mutation"))
            .andExpect(jsonPath("$.mutations[0].item.name.en").value("Prague"))
            .andExpect(jsonPath("$.mutations[0].count").value(2))
            .andExpect(jsonPath("$.mutationalEditions[0].item.type").value("MARK"))
            .andExpect(jsonPath("$.mutationalEditions[0].item.mark").value("***"))
            .andExpect(jsonPath("$.mutationalEditions[0].count").value(1))
    }

    /** Keeps the gRPC diagnostic visible in HTTP while identifying timeouts for localization. */
    @Test
    fun exposesTimeoutCodeAndOriginalMessage() {
        val failure =
            Status.DEADLINE_EXCEEDED.withDescription("core deadline elapsed").asRuntimeException()
        val mvc =
            MockMvcBuilders.standaloneSetup(
                    TemplatePlanningController(
                        { throw failure },
                        mock(CoreVolumeClient::class.java),
                    )
                )
                .build()

        mvc.perform(
                post("/api/export/template-planning/query")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """{"metaTitleId":"title","yearFrom":1900,"yearTo":2000,"mutation":null,"mutationalEdition":null}"""
                    )
            )
            .andExpect(status().isInternalServerError)
            .andExpect(jsonPath("$.status").value(500))
            .andExpect(jsonPath("$.code").value("PLANNING_TIMEOUT"))
            .andExpect(jsonPath("$.message").value(failure.message))
    }
}
