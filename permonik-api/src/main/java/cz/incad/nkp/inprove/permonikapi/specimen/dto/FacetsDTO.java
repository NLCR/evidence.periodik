package cz.incad.nkp.inprove.permonikapi.specimen.dto;

import java.util.List;

public record FacetsDTO(
    List<FacetFieldDTO> names,
    List<FacetFieldDTO> subNames,
    List<FacetFieldDTO> mutationIds,
    List<FacetFieldDTO> editionIds,
    List<FacetFieldDTO> mutationMarks,
    List<FacetFieldDTO> mutationMarkNumbers,
    List<FacetFieldDTO> ownerIds,
    List<FacetFieldDTO> damageTypes
) {
}

