package cz.incad.nkp.inprove.permonikapi.specimen.dto;

import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDTO;

import java.time.Instant;
import java.util.List;

public record SearchedSpecimensDTO(
    List<SpecimenDTO> specimens,
    Instant publicationDayMax,
    Instant publicationDayMin,
    Integer count,
    List<String> owners
) {
}
