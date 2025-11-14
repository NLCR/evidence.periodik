package cz.incad.nkp.inprove.permonikapi.volume.dto;

import cz.incad.nkp.inprove.permonikapi.specimen.model.Specimen;

import java.util.List;


public record VolumeDetailDTO(
    VolumeDTO volume,
    List<Specimen> specimens
) {
}

