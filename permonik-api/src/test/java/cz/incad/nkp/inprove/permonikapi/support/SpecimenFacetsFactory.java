package cz.incad.nkp.inprove.permonikapi.support;

import cz.incad.nkp.inprove.permonikapi.specimen.SpecimenFacets;

import java.util.List;

/**
 * Shared fixture for specimen facets payload used by endpoint tests.
 */
public final class SpecimenFacetsFactory {

    private SpecimenFacetsFactory() {
    }

    public static SpecimenFacets empty() {
        SpecimenFacets facets = new SpecimenFacets();
        facets.setDateStart(null);
        facets.setDateEnd(null);
        facets.setCalendarDateStart("");
        facets.setCalendarDateEnd("");
        facets.setNames(List.of());
        facets.setSubNames(List.of());
        facets.setMutationIds(List.of());
        facets.setEditionIds(List.of());
        facets.setMutationMarks(List.of());
        facets.setOwnerIds(List.of());
        facets.setDamageTypes(List.of());
        facets.setBarCode("");
        facets.setSpecimenStates(List.of());
        return facets;
    }

    public static SpecimenFacets withNames(String... names) {
        SpecimenFacets facets = empty();
        facets.setNames(List.of(names));
        return facets;
    }
}
