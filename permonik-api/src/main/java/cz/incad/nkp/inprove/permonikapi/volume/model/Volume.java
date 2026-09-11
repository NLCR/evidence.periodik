package cz.incad.nkp.inprove.permonikapi.volume.model;

import cz.incad.nkp.inprove.permonikapi.audit.Auditable;
import lombok.*;
import org.apache.solr.client.solrj.beans.Field;
import org.jspecify.annotations.Nullable;
import jakarta.validation.constraints.NotNull;


import java.util.Date;

import static cz.incad.nkp.inprove.permonikapi.volume.model.VolumeDefinition.*;


@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Getter
@Setter
public class Volume extends Auditable {

    @Field(ID_FIELD)
    @NotNull
    private String id; // UUID
    @Field(BAR_CODE_FIELD)
    @NotNull
    private String barCode;
    @Field(DATE_FROM_FIELD)
    @NotNull
    private Date dateFrom;
    @Field(DATE_TO_FIELD)
    @NotNull
    private Date dateTo;
    @Field(META_TITLE_ID_FIELD)
    @NotNull
    private String metaTitleId; // UUID of metaTitle
    @Field(META_TITLE_NAME_FIELD)
    @NotNull
    private String metaTitleName;
    @Field(SUB_NAME_FIELD)
    private @Nullable String subName;
    @Field(MUTATION_ID_FIELD)
    @NotNull
    private String mutationId; // UUID of mutation
    @Field(MUTATION_CS_NAME_FIELD)
    @NotNull
    private String mutationCsName;
    @Field(MUTATION_SK_NAME_FIELD)
    @NotNull
    private String mutationSkName;
    @Field(MUTATION_EN_NAME_FIELD)
    @NotNull
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
    @NotNull
    private String periodicity;
    @Field(FIRST_NUMBER_FIELD)
    @NotNull
    private Integer firstNumber;
    @Field(LAST_NUMBER_FIELD)
    @NotNull
    private Integer lastNumber;
    @Field(NOTE_FIELD)
    private @Nullable String note;
    @Field(ATTACHMENTS_SORT_FIELD)
    @NotNull
    private String attachmentsSort;
    @Field(SIGNATURE_FIELD)
    private @Nullable String signature;
    @Field(OWNER_ID_FIELD)
    @NotNull
    private String ownerId; // UUID of an owner
    @Field(OWNER_NAME_FIELD)
    @NotNull
    private String ownerName;
    @Field(OWNER_SHORTHAND_FIELD)
    @NotNull
    private String ownerShorthand;
    @Field(OWNER_SIGLA_FIELD)
    @NotNull
    private String ownerSigla;
    @Field(YEAR_FIELD)
    @NotNull
    private Integer year;
    @Field(MUTATION_MARK_FIELD)
    private @Nullable String mutationMark;
    @Field(MUTATION_MARK_TYPE_FIELD)
    @NotNull
    private String mutationMarkType;
    @Field(MUTATION_MARK_DESCRIPTION_FIELD)
    private @Nullable String mutationMarkDescription;

    // Custom getter for `subName`
    /** Exposes nullable source text without changing the established REST getter normalization. */
    public @Nullable String rawSubName() { return subName; }
    /** Preserves absent notes for internal source projections. */
    public @Nullable String rawNote() { return note; }
    /** Preserves absent signatures for internal source projections. */
    public @Nullable String rawSignature() { return signature; }
    /** Preserves absent mutation marks for internal source projections. */
    public @Nullable String rawMutationMark() { return mutationMark; }
    /** Preserves absent mutation-mark descriptions. */
    public @Nullable String rawMutationMarkDescription() { return mutationMarkDescription; }

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

    // Custom getter for `mutationMarkDescription`
    public String getMutationMarkDescription() {
        return mutationMarkDescription == null ? "" : mutationMarkDescription;
    }

}
