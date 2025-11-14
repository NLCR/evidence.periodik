package cz.incad.nkp.inprove.permonikapi.volume.dto;

import cz.incad.nkp.inprove.permonikapi.specimen.dto.FacetFieldDTO;
import cz.incad.nkp.inprove.permonikapi.specimen.model.Specimen;

import java.util.List;

public record VolumeOverviewStatsDTO(
    String metaTitleName,
    String ownerId,
    String signature,
    String barCode,
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
