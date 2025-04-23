package cz.incad.nkp.inprove.permonikapi.specimen;

import lombok.*;

import java.util.List;
import java.util.stream.Collectors;


@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@ToString
@Setter
@Getter
public class SpecimenFacets implements SpecimenDefinition {

    private Integer dateStart;
    private Integer dateEnd;
    private String calendarDateStart;
    private String calendarDateEnd;
    private List<String> names;
    private List<String> subNames;
    private List<String> mutationIds;
    private List<String> editionIds;
    private List<String> mutationMarks;
    private List<String> ownerIds;
    private List<String> damageTypes;
    private String barCode;

    private String doUUIDListCollection(List<String> facetList, String field) {
        return facetList.stream()
                .map(facet -> field + ":\"" + facet + "\"")
                .collect(Collectors.joining(" AND "));
    }

    private String doTextListCollection(List<String> namesList, String field) {
        return namesList.stream()
                .map(text -> text.isEmpty() ? field + ":\"\"" : field + ":\"" + text + "\"")
                .collect(Collectors.joining(" AND "));
    }

    String getNamesQueryString() {
        return doTextListCollection(names, NAME_FIELD);
    }

    String getSubNamesQueryString() {
        return doTextListCollection(subNames, SUB_NAME_FIELD);
    }

    String getMutationsQueryString() {
        return doUUIDListCollection(mutationIds, MUTATION_ID_FIELD);
    }

    String getEditionsQueryString() {
        return doUUIDListCollection(editionIds, EDITION_ID_FIELD);
    }

    String getMutationMarkQueryString() {
        return doTextListCollection(mutationMarks, MUTATION_MARK_FIELD);
    }

    String getOwnersQueryString() {
        return doUUIDListCollection(ownerIds, OWNER_ID_FIELD);
    }

    String getDamageTypesQueryString() {
        return doUUIDListCollection(damageTypes, DAMAGE_TYPES_FIELD);
    }

    String getBarCodeQueryString() {
        return BAR_CODE_FIELD + ":*" + barCode + "*";
    }

    // Utility method to escape special characters in query strings
    private String escapeQueryChars(String s) {
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            // List of special characters that need to be escaped
            if (c == '\\' || c == '+' || c == '-' || c == '!' || c == '(' || c == ')' ||
                    c == ':' || c == '^' || c == '[' || c == ']' || c == '\"' || c == '{' ||
                    c == '}' || c == '~' || c == '*' || c == '?' || c == '|' || c == '&' ||
                    c == ';' || c == '/' || Character.isWhitespace(c)) {
                sb.append('\\');
            }
            sb.append(c);
        }
        return sb.toString();
    }
}
