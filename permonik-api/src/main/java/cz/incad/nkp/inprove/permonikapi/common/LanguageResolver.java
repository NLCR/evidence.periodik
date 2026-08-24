package cz.incad.nkp.inprove.permonikapi.common;

import java.util.Locale;
import java.util.Set;

public final class LanguageResolver {

    private static final Set<String> SUPPORTED_LANGUAGES = Set.of("cs", "sk", "en");
    public static final String DEFAULT_LANGUAGE = "cs";

    private LanguageResolver() {
    }

    public static String resolve(String acceptLanguageHeader) {
        if (acceptLanguageHeader != null && !acceptLanguageHeader.isBlank()) {
            String[] languageRanges = acceptLanguageHeader.split(",");
            for (String languageRange : languageRanges) {
                String raw = languageRange.split(";")[0].trim();
                String normalizedHeaderLang = normalizeLanguageCode(raw);
                if (SUPPORTED_LANGUAGES.contains(normalizedHeaderLang)) {
                    return normalizedHeaderLang;
                }
            }
        }

        return DEFAULT_LANGUAGE;
    }

    private static String normalizeLanguageCode(String code) {
        if (code == null || code.isBlank()) {
            return "";
        }
        String lowerCased = code.trim().toLowerCase(Locale.ROOT);
        return lowerCased.split("[-_]")[0];
    }
}
