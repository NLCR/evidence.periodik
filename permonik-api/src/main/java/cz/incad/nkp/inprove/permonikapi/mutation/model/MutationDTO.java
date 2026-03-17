package cz.incad.nkp.inprove.permonikapi.mutation.model;

import cz.incad.nkp.inprove.permonikapi.audit.Auditable;
import cz.incad.nkp.inprove.permonikapi.mutation.dto.MutationNameDTO;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Setter
@Getter
public class MutationDTO extends Auditable {
    private String id;
    private MutationNameDTO name;
    private Boolean isDefault;
    private Boolean isAttachment;
    private Boolean isPeriodicAttachment;
}
