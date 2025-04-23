package cz.incad.nkp.inprove.permonikapi.config.security.auth.form.login;


import cz.incad.nkp.inprove.permonikapi.config.security.auth.form.PermFormAuthenticationProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import static org.springframework.security.web.context.HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY;

@Service
@Slf4j
@AllArgsConstructor
public class LoginService {


    private final PermFormAuthenticationProvider authenticationProvider;


    public void basicLogin(LoginDto loginDto, HttpServletRequest request) {
        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(loginDto.getUsername(), loginDto.getPassword());

        Authentication authentication = authenticationProvider.authenticate(token);
        

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        HttpSession session = request.getSession(true);
        session.setAttribute(SPRING_SECURITY_CONTEXT_KEY, context);
    }

}
