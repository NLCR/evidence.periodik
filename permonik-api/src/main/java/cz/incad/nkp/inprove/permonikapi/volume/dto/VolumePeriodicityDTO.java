package cz.incad.nkp.inprove.permonikapi.volume.dto;

public record VolumePeriodicityDTO(
        String day,
        Boolean numExists,
        String editionId,
        Integer pagesCount,
        String name,
        String subName,
        Boolean isAttachment
) {
}
