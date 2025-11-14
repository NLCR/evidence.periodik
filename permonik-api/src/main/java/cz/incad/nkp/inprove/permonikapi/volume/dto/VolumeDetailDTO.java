package cz.incad.nkp.inprove.permonikapi.volume.dto;

import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDTO;

import java.util.List;


public record VolumeDetailDTO(
    VolumeDTO volume,
    List<SpecimenDTO> specimens
) {
}

