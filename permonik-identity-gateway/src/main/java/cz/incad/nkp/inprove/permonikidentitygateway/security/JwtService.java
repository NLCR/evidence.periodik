package cz.incad.nkp.inprove.permonikidentitygateway.security;

import cz.incad.nkp.inprove.permonikidentitygateway.identity.IdentityPrincipal;
import com.nimbusds.jose.JOSEObjectType;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import java.time.Instant;
import java.util.Date;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JwtService {
    private final JwtProperties properties;

    public String create(IdentityPrincipal principal, String audience) {
        try {
            Instant now = Instant.now();
            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .issuer("permonik-identity-gateway")
                    .subject(principal.id().toString())
                    .audience(audience)
                    .issueTime(Date.from(now))
                    .expirationTime(Date.from(now.plusSeconds(60)))
                    .claim("username", principal.username())
                    .claim("role", principal.role().value())
                    .claim("owners", principal.owners())
                    .claim("authorities", principal.authorityNames())
                    .build();
            SignedJWT jwt = new SignedJWT(new JWSHeader.Builder(JWSAlgorithm.HS256).type(JOSEObjectType.JWT).build(), claims);
            jwt.sign(new MACSigner(properties.secretBytes()));
            return jwt.serialize();
        } catch (Exception exception) {
            throw new IllegalStateException("Could not sign internal JWT", exception);
        }
    }
}
