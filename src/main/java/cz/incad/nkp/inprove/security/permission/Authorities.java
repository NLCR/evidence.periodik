package cz.incad.nkp.inprove.security.permission;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.*;
import java.util.stream.Collectors;

import static cz.incad.nkp.inprove.security.permission.AuthoritiesConstants.*;

@Component
public class Authorities {

    private final Set<String> allAuthorities = getAllAuthorities();

    public Set<GrantedAuthority> getAdminAuthorities() {
        return createAuthorities(allAuthorities.toArray(new String[0]));
    }

    public Set<GrantedAuthority> getUserAuthorities() {
        return createAuthorities(
                VOLUME_READ_DTO,
                EXEMPLAR_READ_DTO,
                CALENDAR_READ_DTO,
                META_TITLE_READ_DTO,

                VOLUME_READ,
                EXEMPLAR_READ,
                CALENDAR_READ,
                META_TITLE_READ
                );
    }

    private Set<GrantedAuthority> createAuthorities(String... authorities) {
        return Arrays.stream(authorities).map(SimpleGrantedAuthority::new).collect(Collectors.toSet());
    }

    private Set<String> getAllAuthorities() {
        Set<String> authorities = new HashSet<>();
        Field[] fields = AuthoritiesConstants.class.getDeclaredFields();

        for (Field f : fields) {
            if (Modifier.isStatic(f.getModifiers()) && Modifier.isPublic(f.getModifiers()) && Modifier.isFinal(f.getModifiers())) {
                try {
                    String authority = (String) f.get(null);
                    authorities.add(authority);
                } catch (IllegalAccessException e) {
                    throw new RuntimeException("Error while trying to get all permissions via java reflection");
                }
            }
        }

        return authorities;
    }
}
