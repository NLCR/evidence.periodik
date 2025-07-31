package cz.incad.nkp.inprove.permonikapi.config;

import lombok.AllArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
@AllArgsConstructor
public class ProfileManager {


    private Environment environment;
    
    public Boolean isDevelopmentEnvironment() {
        return Objects.equals(environment.getProperty("spring.profiles.active", String.class), "dev");
    }

}
