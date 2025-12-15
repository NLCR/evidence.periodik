package cz.incad.nkp.inprove.permonikapi.config;

import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
@RequiredArgsConstructor
public class ProfileManager {


    private final Environment environment;

    public Boolean isDevelopmentEnvironment() {
        return Objects.equals(environment.getProperty("spring.profiles.active", String.class), "dev");
    }

}
