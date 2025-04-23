package cz.incad.nkp.inprove.permonikapi.specimen.dto;

import cz.incad.nkp.inprove.permonikapi.specimen.Specimen;

import java.util.List;

public record SearchedSpecimensDTO(
        List<Specimen> specimens,
        Object publicationDayMax,
        Object publicationDayMin,
        Integer count,
        List<String> owners
) {
}
