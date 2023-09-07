package cz.incad.nkp.inprove.auth;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;


@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth API", description = "API for login of users")
public class AuthApi {

    private AuthService loginService;

    @Operation(summary = "Basic login with Authorization header")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Successfully authenticated"),
            @ApiResponse(responseCode = "403", description = "Authentication failed")})
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/login/basic")
    public void basicLogin() { /* For unified basic login endpoint and openApi documentation reasons */ }

    @Operation(summary = "USE 'permonik(-test).nkp.cz/login/shibboleth' FOR SHIBBOLETH AUTH. This is for " +
            "internal handling shibboleth authentication")
    @GetMapping("/login/shibboleth")
    public void shibbolethLogin(HttpServletRequest request, HttpServletResponse response) throws IOException {
        loginService.shibbolethLogin(request, response);
    }

    @Operation(summary = "Shibboleth/Basic logout which redirects user to homepage")
    @PostMapping("/logout")
    public void shibbolethLogout(HttpServletRequest request, HttpServletResponse response) throws IOException {
        loginService.shibbolethLogout(request, response);
    }

    @Autowired
    public void setLoginService(AuthService loginService) {
        this.loginService = loginService;
    }
}
