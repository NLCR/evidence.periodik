package cz.incad.nkp.inprove.permonikapi.specimen.dto;


import cz.incad.nkp.inprove.permonikapi.specimen.Specimen;

import java.util.List;

public record SpecimensForVolumeOverviewStatsDTO(
        Object publicationDayMin,
        Object publicationDayMax,
        Object pagesCount,
        List<FacetFieldDTO> mutationIds,
        List<FacetFieldDTO> mutationMarks,
        List<FacetFieldDTO> editionIds,
        List<FacetFieldDTO> damageTypes,
        List<FacetFieldDTO> publicationDayRanges,
        List<Specimen> specimens
) {
}
