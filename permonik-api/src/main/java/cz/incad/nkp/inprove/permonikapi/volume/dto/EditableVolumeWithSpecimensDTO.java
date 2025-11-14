package cz.incad.nkp.inprove.permonikapi.volume.dto;

import cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDTO;
import cz.incad.nkp.inprove.permonikapi.volume.Volume;

import java.util.List;

public record EditableVolumeWithSpecimensDTO(Volume volume, List<SpecimenDTO> specimens) {
}

