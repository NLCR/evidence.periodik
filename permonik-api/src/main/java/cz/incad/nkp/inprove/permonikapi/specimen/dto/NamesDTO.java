package cz.incad.nkp.inprove.permonikapi.specimen.dto;

import java.util.List;

public record NamesDTO(
        List<String> names,
        List<String> subNames) {
}
