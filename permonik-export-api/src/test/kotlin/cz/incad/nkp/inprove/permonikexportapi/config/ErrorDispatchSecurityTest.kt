package cz.incad.nkp.inprove.permonikexportapi.config

import jakarta.servlet.DispatcherType
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.context.annotation.Import
import org.springframework.http.ResponseEntity
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@WebMvcTest(
    controllers = [ErrorDispatchSecurityTest.ErrorEndpoint::class],
    properties =
        ["permonik.security.internal-jwt.secret=error-dispatch-test-secret-at-least-32-bytes"],
)
@Import(SecurityConfiguration::class, ErrorDispatchSecurityTest.ErrorEndpoint::class)
@EnableConfigurationProperties(InternalJwtProperties::class)
class ErrorDispatchSecurityTest @Autowired constructor(private val mvc: MockMvc) {
    /**
     * Preserves server errors during servlet error dispatch without opening direct error requests.
     */
    @Test
    fun preservesErrorStatusButDeniesDirectRequests() {
        mvc.perform(
                get("/error").with { request ->
                    request.dispatcherType = DispatcherType.ERROR
                    request
                }
            )
            .andExpect(status().isInternalServerError)
        mvc.perform(get("/error")).andExpect(status().isUnauthorized)
    }

    /** Models the response produced by the servlet container's error endpoint. */
    @RestController
    class ErrorEndpoint {
        /** Returns the original server error after security has allowed error dispatch. */
        @GetMapping("/error")
        fun error(): ResponseEntity<Void> = ResponseEntity.internalServerError().build()
    }
}
