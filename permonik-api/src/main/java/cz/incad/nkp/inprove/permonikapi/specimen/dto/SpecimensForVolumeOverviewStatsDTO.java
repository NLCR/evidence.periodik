package cz.incad.nkp.inprove.permonikapi.specimen.dto;


import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDTO;

import java.time.Instant;
import java.util.List;

public record SpecimensForVolumeOverviewStatsDTO(
    Instant publicationDayMin,
    Instant publicationDayMax,
    Object pagesCount,
    List<FacetFieldDTO> mutationIds,
    List<FacetFieldDTO> mutationMarks,
    List<FacetFieldDTO> editionIds,
    List<FacetFieldDTO> damageTypes,
    List<FacetFieldDTO> publicationDayRanges,
    List<SpecimenDTO> specimens
) {
}
