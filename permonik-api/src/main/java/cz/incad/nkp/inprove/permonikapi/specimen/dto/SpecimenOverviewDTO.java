package cz.incad.nkp.inprove.permonikapi.specimen.dto;

import cz.incad.nkp.inprove.permonikapi.common.mutationMark.MutationMark;
import lombok.*;

import java.util.Date;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@ToString
@Setter
@Getter
public class SpecimenOverviewDTO {
    private String id; // UUID
    private String volumeId;
    private String barCode;
    private String ownerId; // UUID of owner
    private List<String> damageTypes;
    private String name;
    private String subName;
    private String editionId; // UUID of edition
    private String mutationId; // UUID of mutation
    private MutationMark mutationMark;
    private Date publicationDate;
    private String number; // filled if specimen is not attachment
    private String attachmentNumber; // filled if specimen is attachment
    private Integer pagesCount;
    private Boolean isAttachment;
}
