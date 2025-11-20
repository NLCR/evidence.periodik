package cz.incad.nkp.inprove.permonikapi.specimen.dto;

import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDTO;

import java.util.List;

public record SearchedSpecimensDTO(
    List<SpecimenDTO> specimens,
    Object publicationDayMax,
    Object publicationDayMin,
    Integer count,
    List<String> owners
) {
}
