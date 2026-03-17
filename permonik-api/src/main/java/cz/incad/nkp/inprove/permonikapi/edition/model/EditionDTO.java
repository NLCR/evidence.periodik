package cz.incad.nkp.inprove.permonikapi.edition.model;

import cz.incad.nkp.inprove.permonikapi.audit.Auditable;
import cz.incad.nkp.inprove.permonikapi.edition.dto.EditionNameDTO;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Setter
@Getter
public class EditionDTO extends Auditable {
    private String id;
    private EditionNameDTO name;
    private Boolean isDefault;
    private Boolean isAttachment;
    private Boolean isPeriodicAttachment;
}
