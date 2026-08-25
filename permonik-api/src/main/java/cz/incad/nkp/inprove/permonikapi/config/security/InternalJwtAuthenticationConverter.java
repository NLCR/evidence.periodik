package cz.incad.nkp.inprove.permonikapi.config.security;

import java.util.List;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
public class InternalJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {
    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        String username = jwt.getClaimAsString("username");
        String role = jwt.getClaimAsString("role");
        List<String> owners = listClaim(jwt, "owners");
        var authorities = listClaim(jwt, "authorities").stream().map(SimpleGrantedAuthority::new).toList();
        if (jwt.getSubject() == null || username == null || role == null || authorities.isEmpty()) {
            throw new IllegalArgumentException("Internal JWT is missing required identity claims");
        }
        var principal = new InternalPrincipal(jwt.getSubject(), username, role, owners);
        return new PreAuthenticatedAuthenticationToken(principal, jwt.getTokenValue(), authorities);
    }

    private static List<String> listClaim(Jwt jwt, String name) {
        List<String> values = jwt.getClaimAsStringList(name);
        return values == null ? List.of() : List.copyOf(values);
    }
}
