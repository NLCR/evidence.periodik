package cz.incad.nkp.inprove.permonikidentitygateway.identity

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.test.context.runner.ApplicationContextRunner
import org.springframework.context.annotation.Configuration

class DevUserPropertiesTest {

    /** Ensures SAML deployments start without binding development-only login credentials. */
    @Test
    fun samlProfilesDoNotRegisterDevelopmentCredentials() {
        for (profile in listOf("test", "prod")) {
            ApplicationContextRunner()
                .withUserConfiguration(PropertiesScanConfiguration::class.java)
                .withPropertyValues("spring.profiles.active=$profile")
                .run { context ->
                    assertThat(context)
                        .hasNotFailed()
                        .doesNotHaveBean(DevUserProperties::class.java)
                }
        }
    }

    @Configuration(proxyBeanMethods = false)
    @ConfigurationPropertiesScan(basePackageClasses = [DevUserProperties::class])
    private class PropertiesScanConfiguration
}
