package cz.incad.nkp.inprove.permonikidentitygateway.identity;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class IdentityService {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;

    private static String normalize(String value) {
        return value.trim().toLowerCase(Locale.ROOT);
    }

    @Transactional(readOnly = true)
    public IdentityPrincipal authenticate(String username, String password) {
        UserEntity user = users.findByUsernameIgnoreCase(normalize(username))
                .filter(UserEntity::isActive)
                .filter(candidate -> candidate.getPasswordHash() != null && passwordEncoder.matches(password, candidate.getPasswordHash()))
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        return IdentityPrincipal.from(user);
    }

    @Transactional(readOnly = true)
    public List<UserDto> list() {
        return users.findAll().stream().map(UserDto::from).toList();
    }

    @Transactional
    public IdentityPrincipal update(UUID id, UserDto input) {
        UserEntity user = users.findById(id).orElseThrow(() -> new ResponseStatusException(NOT_FOUND));
        user.setUsername(normalize(input.userName()));
        user.setEmail(normalize(input.email()));
        user.setFirstName(input.firstName().trim());
        user.setLastName(input.lastName().trim());
        user.setRole(input.role());
        user.setActive(input.active());
        user.setOwners(new LinkedHashSet<>(input.owners() == null ? List.of() : input.owners()));
        return IdentityPrincipal.from(users.save(user));
    }

    @Transactional
    public IdentityPrincipal provisionSaml(String idpEntityId, String eppn, String firstName,
                                           String lastName, String email) {
        String username = normalize(eppn);
        email = normalize(email);
        String normalizedUsername = username;
        String normalizedEmail = email;
        UserEntity user = users.findBySamlIdpEntityIdAndSamlEppn(idpEntityId, username).orElseGet(() -> {
            UserEntity created = new UserEntity();
            created.setUsername(normalizedUsername);
            created.setEmail(normalizedEmail);
            created.setFirstName(firstName);
            created.setLastName(lastName);
            created.setRole(UserRole.USER);
            created.setActive(true);
            created.setSamlIdpEntityId(idpEntityId);
            created.setSamlEppn(normalizedUsername);
            return users.save(created);
        });
        if (!user.isActive()) throw new BadCredentialsException("User is inactive");
        user.setUsername(username);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        users.save(user);
        return IdentityPrincipal.from(user);
    }
}
