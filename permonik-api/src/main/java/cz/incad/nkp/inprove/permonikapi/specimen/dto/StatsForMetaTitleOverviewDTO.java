package cz.incad.nkp.inprove.permonikapi.specimen.dto;

public record StatsForMetaTitleOverviewDTO(
        Object publicationDayMin,
        Object publicationDayMax,
        Long mutationsCount,
        Long ownersCount,
        Integer matchedSpecimens
) {
}
