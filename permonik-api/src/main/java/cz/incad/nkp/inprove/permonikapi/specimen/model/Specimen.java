package cz.incad.nkp.inprove.permonikapi.specimen.model;

import cz.incad.nkp.inprove.permonikapi.audit.Auditable;
import lombok.*;
import org.apache.solr.client.solrj.beans.Field;

import java.util.Collections;
import java.util.Date;
import java.util.List;

import static cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDefinition.*;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Setter
@Getter
public class Specimen extends Auditable {

    @Field(ID_FIELD)
    private String id; // UUID
    @Field(META_TITLE_ID_FIELD)
    private String metaTitleId; // UUID of metaTitle
    @Field(META_TITLE_NAME_FIELD)
    private String metaTitleName; // Name of metaTitle
    @Field(VOLUME_ID_FIELD)
    private String volumeId;
    @Field(BAR_CODE_FIELD)
    private String barCode;
    @Field(NUM_EXISTS_FIELD)
    private Boolean numExists;
    @Field(NUM_MISSING_FIELD)
    private Boolean numMissing;
    @Field(OWNER_ID_FIELD)
    private String ownerId; // UUID of an owner
    @Field(OWNER_NAME_FIELD)
    private String ownerName;
    @Field(DAMAGE_TYPES_FIELD)
    private List<String> damageTypes;
    @Field(DAMAGED_PAGES_FIELD)
    private List<Integer> damagedPages; // stored by real pages, so first page = 1, second page = 2 etc. Starting from 1, not 0
    @Field(MISSING_PAGES_FIELD)
    private List<Integer> missingPages; // stored by real pages, so first page = 1, second page = 2 etc. Starting from 1, not 0
    @Field(NOTE_FIELD)
    private String note;
    @Field(NAME_FIELD)
    private String name;
    @Field(SUB_NAME_FIELD)
    private String subName;
    @Field(EDITION_ID_FIELD)
    private String editionId; // UUID of edition
    @Field(EDITION_CS_NAME_FIELD)
    private String editionCsName; // Name of an edition
    @Field(EDITION_SK_NAME_FIELD)
    private String editionSkName; // Name of an edition
    @Field(EDITION_EN_NAME_FIELD)
    private String editionEnName; // Name of an edition
    @Field(MUTATION_ID_FIELD)
    private String mutationId; // UUID of mutation
    @Field(MUTATION_CS_NAME_FIELD)
    private String mutationCsName; // Name of a mutation
    @Field(MUTATION_SK_NAME_FIELD)
    private String mutationSkName; // Name of a mutation
    @Field(MUTATION_EN_NAME_FIELD)
    private String mutationEnName; // Name of a mutation
    @Field(MUTATION_MARK_FIELD)
    private String mutationMark;
    @Field(MUTATION_MARK_TYPE_FIELD)
    private String mutationMarkType;
    @Field(MUTATION_MARK_DESCRIPTION_FIELD)
    private String mutationMarkDescription;
    @Field(PUBLICATION_DATE_FIELD)
    private Date publicationDate;
    @Field(NUMBER_FIELD)
    private String number; // filled if specimen is not attachment
    @Field(ATTACHMENT_NUMBER_FIELD)
    private String attachmentNumber; // filled if specimen is an attachment
    @Field(PAGES_COUNT_FIELD)
    private Integer pagesCount;
    @Field(IS_ATTACHMENT_FIELD)
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

    // Custom getter for `mutationMarkType`
    public String getMutationMarkType() {
        return mutationMarkType == null ? "" : mutationMarkType;
    }

    // Custom getter for `mutationMarkDescription`
    public String getMutationMarkDescription() {
        return mutationMarkDescription == null ? "" : mutationMarkDescription;
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
