package cz.incad.nkp.inprove.permonikidentitygateway.identity;

import org.jspecify.annotations.NonNull;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("dev")
@RequiredArgsConstructor
public class DevIdentitySeeder implements ApplicationRunner {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final DevUserProperties properties;

    @Override
    @Transactional
    public void run(@NonNull ApplicationArguments args) {
        UserEntity user = users.findByUsernameIgnoreCase(properties.username()).orElseGet(() -> {
            UserEntity seededUser = new UserEntity();
            seededUser.setUsername(properties.username());
            seededUser.setEmail(properties.email());
            seededUser.setFirstName("Development");
            seededUser.setLastName("Administrator");
            seededUser.setRole(UserRole.ADMIN);
            seededUser.setActive(true);
            return seededUser;
        });

        if (user.getPasswordHash() == null || !encoder.matches(properties.password(), user.getPasswordHash())) {
            user.setPasswordHash(encoder.encode(properties.password()));
        }

        users.save(user);
    }
}
