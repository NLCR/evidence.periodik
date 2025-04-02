package cz.incad.nkp.inprove.permonikapi.config.security.auth.shibboleth;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.apache.solr.client.solrj.SolrServerException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
@Tag(name = "Auth API", description = "API for users login")
public class ShibbolethController {

    private final ShibbolethService shibbolethService;

    @Operation(summary = "USE 'permonik(-test).nkp.cz/login/shibboleth' FOR SHIBBOLETH AUTH. This is for " +
            "internal handling shibboleth authentication (redirect from shibboleth IdP)")
    @GetMapping("/login/shibboleth")
    public void shibbolethLogin(HttpServletRequest request, HttpServletResponse response) throws IOException, SolrServerException {
        shibbolethService.shibbolethLogin(request, response);
    }

    @Operation(summary = "Shibboleth/Basic logout which redirects user to homepage")
    @PostMapping("/logout")
    public void shibbolethLogout(HttpServletRequest request, HttpServletResponse response) throws IOException {
        shibbolethService.shibbolethLogout(request, response);
    }
}
