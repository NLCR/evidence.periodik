package cz.incad.nkp.inprove.permonikapi.volume.dto;

import java.util.List;

public record VolumeDTO(
        String id,
        String barCode,
        String dateFrom,
        String dateTo,
        String metaTitleId,
        String subName,
        String mutationId,
        List<VolumePeriodicityDTO> periodicity,
        Integer firstNumber,
        Integer lastNumber,
        String note,
        Boolean showAttachmentsAtTheEnd,
        String signature,
        String ownerId,
        Integer year,
        String mutationMark,
        String created,
        String createdBy,
        String updated,
        String updatedBy,
        String deleted,
        String deletedBy
) {
}
