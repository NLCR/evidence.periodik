package cz.incad.nkp.inprove.permonikapi.specimen.dto;

import java.time.Instant;
import java.util.List;

public record SpecimensOverviewDTO(
    List<SpecimenOverviewDTO> specimens,
    Instant publicationDayMax,
    Instant publicationDayMin,
    Integer count,
    List<String> owners
) {
}
