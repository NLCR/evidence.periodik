package cz.incad.nkp.inprove.permonikapi.volume.dto;

import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDTO;
import cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDTO;

import java.util.List;

public record EditableVolumeWithSpecimensDTO(VolumeDTO volume, List<SpecimenDTO> specimens) {
}

