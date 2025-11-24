package cz.incad.nkp.inprove.permonikapi.specimen.model;

import cz.incad.nkp.inprove.permonikapi.audit.Auditable;
import cz.incad.nkp.inprove.permonikapi.common.mutationMark.MutationMark;
import lombok.*;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Setter
@Getter
public class SpecimenDTO extends Auditable {
    private String id; // UUID
    private String metaTitleId; // UUID of metaTitle
    private String volumeId;
    private String barCode;
    private Boolean numExists;
    private Boolean numMissing;
    private String ownerId; // UUID of owner
    private List<String> damageTypes;
    private List<Integer> damagedPages; // stored by real pages, so first page = 1, second page = 2 etc. Starting from 1, not 0
    private List<Integer> missingPages; // stored by real pages, so first page = 1, second page = 2 etc. Starting from 1, not 0
    private String note;
    private String name;
    private String subName;
    private String editionId; // UUID of edition
    private String mutationId; // UUID of mutation
    private MutationMark mutationMark;
    private String publicationDate;
    private String publicationDateString;
    private String number; // filled if specimen is not attachment
    private String attachmentNumber; // filled if specimen is attachment
    private Integer pagesCount;
    private Boolean isAttachment;
}
