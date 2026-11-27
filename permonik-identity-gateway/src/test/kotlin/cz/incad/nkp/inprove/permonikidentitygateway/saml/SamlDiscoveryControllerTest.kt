package cz.incad.nkp.inprove.permonikidentitygateway.saml

import java.net.URI
import java.net.URLDecoder
import java.nio.charset.StandardCharsets
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.core.io.ByteArrayResource
import org.springframework.mock.web.MockHttpSession
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.util.UriComponentsBuilder

class SamlDiscoveryControllerTest {

    /** Verifies registered HTTPS discovery behind an HTTP proxy and callback state validation. */
    @Test
    fun discoveryUsesPublicRegisteredEndpointAndValidatesState() {
        val unusedResource = ByteArrayResource(byteArrayOf())
        val properties =
            SamlProperties(
                entityId = "https://sp.example.test/shibboleth",
                acs = "https://sp.example.test/Shibboleth.sso/SAML2/POST",
                signingKey = unusedResource,
                signingCertificate = unusedResource,
                metadataUrl = "https://metadata.example.test/idp",
                wayfUrl = "https://ds.eduid.cz/wayf.php",
            )
        val settings = SamlConfiguration(properties).samlSettings()
        val mvc = MockMvcBuilders.standaloneSetup(SamlDiscoveryController(settings)).build()
        val session = MockHttpSession()
        val wayf =
            mvc.perform(get("http://internal-gateway/api/auth/login/shibboleth").session(session))
                .andExpect(status().is3xxRedirection)
                .andReturn()
                .response
                .redirectedUrl
        val parameters =
            UriComponentsBuilder.fromUriString(requireNotNull(wayf)).build().queryParams
        val callback =
            URI.create(
                URLDecoder.decode(
                    requireNotNull(parameters.getFirst("return")),
                    StandardCharsets.UTF_8,
                )
            )
        assertEquals("https", callback.scheme)
        assertEquals("sp.example.test", callback.host)
        assertEquals("/Shibboleth.sso/Login", callback.path)
        val state =
            requireNotNull(
                UriComponentsBuilder.fromUri(callback).build().queryParams.getFirst("state")
            )
        val idp = "https://shibboleth.nkp.cz/idp/shibboleth"

        mvc.perform(
                get(callback.path).session(session).param("state", "invalid").param("entityID", idp)
            )
            .andExpect(status().isBadRequest)
        mvc.perform(
                get(callback.path).session(session).param("state", state).param("entityID", idp)
            )
            .andExpect(status().is3xxRedirection)
            .andExpect(redirectedUrl("/saml2/authenticate/idp-3"))
    }
}
