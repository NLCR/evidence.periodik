package cz.incad.nkp.inprove.permonikapi.volume.dto;

import cz.incad.nkp.inprove.permonikapi.specimen.model.Specimen;
import cz.incad.nkp.inprove.permonikapi.volume.Volume;

import java.util.List;

public record EditableVolumeWithSpecimensDTO(Volume volume, List<Specimen> specimens) {
}

