package cz.incad.nkp.inprove.permonikapi.specimen.dto;

import java.time.Instant;

public record StatsForMetaTitleOverviewDTO(
        Instant publicationDayMin,
        Instant publicationDayMax,
        Long mutationsCount,
        Long ownersCount,
        Integer matchedSpecimens
) {
}
