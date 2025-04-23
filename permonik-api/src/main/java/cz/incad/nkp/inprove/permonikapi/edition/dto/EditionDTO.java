package cz.incad.nkp.inprove.permonikapi.edition.dto;

public record EditionDTO(String id, EditionNameDTO name, Boolean isDefault, Boolean isAttachment,
                         Boolean isPeriodicAttachment) {
}
