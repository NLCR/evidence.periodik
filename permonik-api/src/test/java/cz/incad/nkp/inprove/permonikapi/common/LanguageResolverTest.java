package cz.incad.nkp.inprove.permonikapi.common;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class LanguageResolverTest {

    @Test
    void resolve_usesAcceptLanguageHeader() {
        String resolved = LanguageResolver.resolve("en-US,en;q=0.9");
        assertThat(resolved).isEqualTo("en");
    }

    @Test
    void resolve_fallsBackToCzechForUnsupportedHeader() {
        String resolved = LanguageResolver.resolve("fr-FR,fr;q=0.9");
        assertThat(resolved).isEqualTo("cs");
    }

    @Test
    void resolve_fallsBackToCzechForMissingHeader() {
        String resolved = LanguageResolver.resolve(null);
        assertThat(resolved).isEqualTo("cs");
    }
}
