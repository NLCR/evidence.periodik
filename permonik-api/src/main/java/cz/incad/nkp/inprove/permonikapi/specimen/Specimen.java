package cz.incad.nkp.inprove.permonikapi.specimen;

import cz.incad.nkp.inprove.permonikapi.audit.Auditable;
import lombok.*;
import org.apache.solr.client.solrj.beans.Field;

import java.util.Collections;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Setter
@Getter
public class Specimen extends Auditable {

    @Field
    private String id; // UUID
    @Field
    private String metaTitleId; // UUID of metaTitle
    @Field
    private String volumeId;
    @Field
    private String barCode;
    @Field
    private Boolean numExists;
    @Field
    private Boolean numMissing;
    @Field
    private String ownerId; // UUID of owner
    @Field
    private List<String> damageTypes;
    @Field
    private List<Integer> damagedPages; // stored by real pages, so first page = 1, second page = 2 etc. Starting from 1, not 0
    @Field
    private List<Integer> missingPages; // stored by real pages, so first page = 1, second page = 2 etc. Starting from 1, not 0
    @Field
    private String note;
    @Field
    private String name;
    @Field
    private String subName;
    @Field
    private String editionId; // UUID of edition
    @Field
    private String mutationId; // UUID of mutation
    @Field
    private String mutationMark;
    @Field
    private String publicationDate;
    @Field
    private String publicationDateString;
    @Field
    private String number; // filled if specimen is not attachment
    @Field
    private String attachmentNumber; // filled if specimen is attachment
    @Field
    private Integer pagesCount;
    @Field
    private Boolean isAttachment;

    // Custom getter for `note`
    public String getNote() {
        return note == null ? "" : note;
    }

    // Custom getter for `name`
    public String getName() {
        return name == null ? "" : name;
    }

    // Custom getter for `subName`
    public String getSubName() {
        return subName == null ? "" : subName;
    }

    // Custom getter for `mutationMark`
    public String getMutationMark() {
        return mutationMark == null ? "" : mutationMark;
    }

    // Custom getter for `number`
    public String getNumber() {
        return number == null ? "" : number;
    }

    // Custom getter for `attachmentNumber`
    public String getAttachmentNumber() {
        return attachmentNumber == null ? "" : attachmentNumber;
    }

    // Custom getter for `damageTypes`
    public List<String> getDamageTypes() {
        return damageTypes == null ? Collections.emptyList() : damageTypes;
    }

    // Custom getter for `damagedPages`
    public List<Integer> getDamagedPages() {
        return damagedPages == null ? Collections.emptyList() : damagedPages;
    }

    // Custom getter for `missingPages`
    public List<Integer> getMissingPages() {
        return missingPages == null ? Collections.emptyList() : missingPages;
    }
}
