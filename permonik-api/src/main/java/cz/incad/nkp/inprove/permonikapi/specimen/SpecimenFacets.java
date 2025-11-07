package cz.incad.nkp.inprove.permonikapi.specimen;

import cz.incad.nkp.inprove.permonikapi.specimen.dto.SpecimenStateDTO;
import lombok.*;

import java.util.ArrayList;
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
    private List<String> mutationMarkNumbers;
    private List<String> ownerIds;
    private List<String> damageTypes;
    private String barCode;
    private List<SpecimenStateDTO> specimenStates;

    private String doUUIDListCollection(List<String> facetList, String field) {
        return facetList.stream()
            .map(facet -> field + ":\"" + facet + "\"")
            .collect(Collectors.joining(" AND "));
    }

    private String doTextListCollection(List<String> namesList, String field, Boolean valueCanBeNull) {
        return namesList.stream()
            .map(text -> text.isEmpty() ? valueCanBeNull ? "-" + field + ":[* TO *]" : field + ":\"\"" : field + ":\"" + text + "\"")
            .collect(Collectors.joining(" AND "));
    }

    String getNamesQueryString() {
        return doTextListCollection(names, NAME_FIELD, false);
    }

    String getSubNamesQueryString() {
        return doTextListCollection(subNames, SUB_NAME_FIELD, false);
    }

    String getMutationsQueryString() {
        return doUUIDListCollection(mutationIds, MUTATION_ID_FIELD);
    }

    String getEditionsQueryString() {
        return doUUIDListCollection(editionIds, EDITION_ID_FIELD);
    }

    String getMutationMarkQueryString() {
        return doTextListCollection(mutationMarks, MUTATION_MARK_FIELD, true);
    }

    String getMutationMarkNumberQueryString() {
        return doTextListCollection(mutationMarks, MUTATION_MARK_NUMBER_FIELD, true);
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

    String getSpecimenStatesQueryString() {
        List<String> clauses = new ArrayList<>();

        for (SpecimenStateDTO state : specimenStates) {
            if (Boolean.TRUE.equals(state.active())) {
                switch (state.id()) {
                    case NUM_EXISTS -> clauses.add(NUM_EXISTS_FIELD + ":true");
                    case NUM_MISSING -> clauses.add(NUM_MISSING_FIELD + ":true");
                }
            }
        }

//        if (clauses.isEmpty()) {
//            return NUM_EXISTS_FIELD + ":true";
//        }

        return String.join(" OR ", clauses);

    }

}
