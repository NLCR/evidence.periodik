package cz.incad.nkp.inprove.permonikapi.specimen.model;

import static cz.incad.nkp.inprove.permonikapi.specimen.model.SpecimenDefinition.*;

import cz.incad.nkp.inprove.permonikapi.audit.Auditable;
import cz.incad.nkp.inprove.permonikdomain.SpecimenDamageType;
import jakarta.validation.constraints.NotNull;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.solr.client.solrj.beans.Field;
import org.jspecify.annotations.Nullable;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Setter
@Getter
@Slf4j
public class Specimen extends Auditable {

    @Field(ID_FIELD)
    @NotNull
    private String id; // UUID

    @Field(META_TITLE_ID_FIELD)
    @NotNull
    private String metaTitleId; // UUID of metaTitle

    @Field(META_TITLE_NAME_FIELD)
    @NotNull
    private String metaTitleName; // Name of metaTitle

    @Field(VOLUME_ID_FIELD)
    @NotNull
    private String volumeId;

    @Field(BAR_CODE_FIELD)
    @NotNull
    private String barCode;

    @Field(NUM_EXISTS_FIELD)
    @NotNull
    private Boolean numExists;

    @Field(NUM_MISSING_FIELD)
    @NotNull
    private Boolean numMissing;

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

    private @Nullable List<String> damageTypes;

    @Field(DAMAGED_PAGES_FIELD)
    private @Nullable List<Integer>
            damagedPages; // stored by real pages, so first page = 1, second page = 2 etc. Starting

    // from 1, not 0

    @Field(MISSING_PAGES_FIELD)
    private @Nullable List<Integer>
            missingPages; // stored by real pages, so first page = 1, second page = 2 etc. Starting

    // from 1, not 0

    @Field(NOTE_FIELD)
    private @Nullable String note;

    @Field(NAME_FIELD)
    private @Nullable String name;

    @Field(SUB_NAME_FIELD)
    private @Nullable String subName;

    @Field(EDITION_ID_FIELD)
    @NotNull
    private String editionId; // UUID of edition

    @Field(EDITION_CS_NAME_FIELD)
    @NotNull
    private String editionCsName; // Name of an edition

    @Field(EDITION_SK_NAME_FIELD)
    @NotNull
    private String editionSkName; // Name of an edition

    @Field(EDITION_EN_NAME_FIELD)
    @NotNull
    private String editionEnName; // Name of an edition

    @Field(MUTATION_ID_FIELD)
    @NotNull
    private String mutationId; // UUID of mutation

    @Field(MUTATION_CS_NAME_FIELD)
    @NotNull
    private String mutationCsName; // Name of a mutation

    @Field(MUTATION_SK_NAME_FIELD)
    @NotNull
    private String mutationSkName; // Name of a mutation

    @Field(MUTATION_EN_NAME_FIELD)
    @NotNull
    private String mutationEnName; // Name of a mutation

    @Field(MUTATION_MARK_FIELD)
    private @Nullable String mutationMark;

    @Field(MUTATION_MARK_TYPE_FIELD)
    @NotNull
    private String mutationMarkType;

    @Field(MUTATION_MARK_DESCRIPTION_FIELD)
    private @Nullable String mutationMarkDescription;

    @Field(PUBLICATION_DATE_FIELD)
    @NotNull
    private Date publicationDate;

    @Field(NUMBER_FIELD)
    private @Nullable String number; // filled if specimen is not attachment

    @Field(ATTACHMENT_NUMBER_FIELD)
    private @Nullable String attachmentNumber; // filled if specimen is an attachment

    @Field(NUMBER_SORT_KEY_FIELD)
    private @Nullable String
            numberSortKey; // normalized key used for natural sorting of number/attachmentNumber

    @Field(PAGES_COUNT_FIELD)
    @NotNull
    private Integer pagesCount;

    @Field(IS_ATTACHMENT_FIELD)
    @NotNull
    private Boolean isAttachment;

    // Custom getter for `note`
    /** Preserves nullable source names without changing REST normalization. */
    public @Nullable String rawName() {
        return name;
    }

    /** Preserves nullable source subtitles. */
    public @Nullable String rawSubName() {
        return subName;
    }

    /** Preserves absent mutation marks. */
    public @Nullable String rawMutationMark() {
        return mutationMark;
    }

    /** Preserves absent mutation-mark descriptions. */
    public @Nullable String rawMutationMarkDescription() {
        return mutationMarkDescription;
    }

    /** Preserves absent issue numbers. */
    public @Nullable String rawNumber() {
        return number;
    }

    /** Preserves absent attachment numbers. */
    public @Nullable String rawAttachmentNumber() {
        return attachmentNumber;
    }

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

    /** Preserves historical Solr codes verbatim and warns about unrecognized values. */
    @Field(DAMAGE_TYPES_FIELD)
    public void setDamageTypes(@Nullable List<String> damageTypes) {
        if (damageTypes != null) {
            for (String code : damageTypes) {
                if (SpecimenDamageType.fromCode(code) == null) {
                    log.warn("Unknown specimen damage code: {}", code);
                }
            }
        }
        this.damageTypes = damageTypes;
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
