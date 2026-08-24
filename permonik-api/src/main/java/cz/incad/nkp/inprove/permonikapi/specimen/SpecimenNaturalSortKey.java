package cz.incad.nkp.inprove.permonikapi.specimen;

import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Builds a deterministic, natural-sort friendly key for mixed alphanumeric issue identifiers
 * such as "1", "10", "1a", or "1-2".
 */
public final class SpecimenNaturalSortKey {

    private static final Pattern DIGIT_RUN = Pattern.compile("\\d+");

    private SpecimenNaturalSortKey() {
    }

    public static String from(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim().toLowerCase(Locale.ROOT);
        if (normalized.isEmpty()) {
            return null;
        }

        StringBuilder key = new StringBuilder(normalized.length() + 16);
        Matcher matcher = DIGIT_RUN.matcher(normalized);
        int index = 0;

        while (matcher.find()) {
            appendTextToken(key, normalized, index, matcher.start());
            appendNumericToken(key, matcher.group());
            index = matcher.end();
        }

        appendTextToken(key, normalized, index, normalized.length());

        return key.toString();
    }

    private static void appendTextToken(StringBuilder key, String source, int from, int to) {
        if (from >= to) {
            return;
        }
        key.append('T').append(source, from, to).append(';');
    }

    private static void appendNumericToken(StringBuilder key, String digits) {
        String canonical = digits.replaceFirst("^0+(?!$)", "");
        key.append('N')
            .append(String.format(Locale.ROOT, "%06d", canonical.length()))
            .append(':')
            .append(canonical)
            .append(';');
    }
}
