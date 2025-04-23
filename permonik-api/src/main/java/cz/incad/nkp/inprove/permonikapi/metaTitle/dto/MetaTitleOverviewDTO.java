package cz.incad.nkp.inprove.permonikapi.metaTitle.dto;

import cz.incad.nkp.inprove.permonikapi.specimen.dto.StatsForMetaTitleOverviewDTO;

public record MetaTitleOverviewDTO(
        String id,
        String name,
        StatsForMetaTitleOverviewDTO specimens
) {
}
