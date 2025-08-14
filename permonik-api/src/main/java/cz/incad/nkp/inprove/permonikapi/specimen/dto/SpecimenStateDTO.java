package cz.incad.nkp.inprove.permonikapi.specimen.dto;

import cz.incad.nkp.inprove.permonikapi.specimen.enums.SpecimenStateTypeEnum;

public record SpecimenStateDTO(SpecimenStateTypeEnum id, Boolean active) {
}
