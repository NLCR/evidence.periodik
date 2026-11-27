package cz.incad.nkp.inprove.permonikapi.specimen.dto;

import java.util.List;

public record SpecimensOverviewDTO(
    List<SpecimenOverviewDTO> specimens,
    Object publicationDayMax,
    Object publicationDayMin,
    Integer count,
    List<String> owners
) {
}
