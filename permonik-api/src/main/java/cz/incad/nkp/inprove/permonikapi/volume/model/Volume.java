package cz.incad.nkp.inprove.permonikapi.volume.model;

import cz.incad.nkp.inprove.permonikapi.audit.Auditable;
import cz.incad.nkp.inprove.permonikapi.volume.enums.AttachmentsSortEnum;
import lombok.*;
import org.apache.solr.client.solrj.beans.Field;

import java.time.Instant;

import static cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition.*;


@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Getter
@Setter
public class Volume extends Auditable {

    @Field(ID_FIELD)
    private String id; // UUID
    @Field(BAR_CODE_FIELD)
    private String barCode;
    @Field(DATE_FROM_FIELD)
    private Instant dateFrom;
    @Field(DATE_TO_FIELD)
    private Instant dateTo;
    @Field(META_TITLE_ID_FIELD)
    private String metaTitleId; // UUID of metaTitle
    @Field(META_TITLE_NAME_FIELD)
    private String metaTitleName;
    @Field(SUB_NAME_FIELD)
    private String subName;
    @Field(MUTATION_ID_FIELD)
    private String mutationId; // UUID of mutation
    @Field(MUTATION_CS_NAME_FIELD)
    private String mutationCsName;
    @Field(MUTATION_SK_NAME_FIELD)
    private String mutationSkName;
    @Field(MUTATION_EN_NAME_FIELD)
    private String mutationEnName;
    /*
    periodicity as string
    {
      "day": "Monday",
      "numExists": true,
      "editionId": "fd041788-b3c3-4fe9-b824-899aaad62ca3",
      "pagesCount": 0,
      "name": "Mladá fronta (TESTOVACÍ DATA)",
      "subName": "",
      "isAttachment": false
    },
    */
    @Field(PERIODICITY_FIELD)
    private String periodicity;
    @Field(FIRST_NUMBER_FIELD)
    private Integer firstNumber;
    @Field(LAST_NUMBER_FIELD)
    private Integer lastNumber;
    @Field(NOTE_FIELD)
    private String note;
    @Field(ATTACHMENTS_SORT_FIELD)
    private AttachmentsSortEnum attachmentsSort;
    @Field(SIGNATURE_FIELD)
    private String signature;
    @Field(OWNER_ID_FIELD)
    private String ownerId; // UUID of an owner
    @Field(OWNER_NAME_FIELD)
    private String ownerName;
    @Field(YEAR_FIELD)
    private Integer year;
    @Field(MUTATION_MARK_FIELD)
    private String mutationMark;
    @Field(MUTATION_MARK_TYPE_FIELD)
    private String mutationMarkType;
    @Field(MUTATION_MARK_DESCRIPTION_FIELD)
    private String mutationMarkDescription;

    // Custom getter for `subName`
    public String getSubName() {
        return subName == null ? "" : subName;
    }

    // Custom getter for `note`
    public String getNote() {
        return note == null ? "" : note;
    }

    // Custom getter for `signature`
    public String getSignature() {
        return signature == null ? "" : signature;
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

}
