package cz.incad.nkp.inprove.permonikapi.volume.model;

import cz.incad.nkp.inprove.permonikapi.audit.Auditable;
import cz.incad.nkp.inprove.permonikapi.common.mutationMark.MutationMark;
import cz.incad.nkp.inprove.permonikapi.volume.dto.VolumePeriodicityDTO;
import lombok.*;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Setter
@Getter
public class VolumeDTO extends Auditable {
    private String id;
    private String barCode;
    private String dateFrom;
    private String dateTo;
    private String metaTitleId;
    private String subName;
    private String mutationId;
    private List<VolumePeriodicityDTO> periodicity;
    private Integer firstNumber;
    private Integer lastNumber;
    private String note;
    private Boolean showAttachmentsAtTheEnd;
    private String signature;
    private String ownerId;
    private Integer year;
    private MutationMark mutationMark;
}
