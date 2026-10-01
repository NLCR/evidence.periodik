package cz.incad.nkp.inprove.permonikapi.edition.model;

import static cz.incad.nkp.inprove.permonikapi.edition.model.EditionDefinition.*;

import cz.incad.nkp.inprove.permonikapi.audit.Auditable;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.apache.solr.client.solrj.beans.Field;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Setter
@Getter
public class Edition extends Auditable {

    @Field(ID_FIELD)
    @NotNull
    private String id; // UUID

    @Field(NAME_CS_FIELD)
    @NotNull
    private String nameCs;

    @Field(NAME_SK_FIELD)
    @NotNull
    private String nameSk;

    @Field(NAME_EN_FIELD)
    @NotNull
    private String nameEn;

    @Field(IS_DEFAULT_FIELD)
    @NotNull
    private Boolean isDefault;

    @Field(IS_ATTACHMENT_FIELD)
    @NotNull
    private Boolean isAttachment;

    @Field(IS_PERIODIC_ATTACHMENT_FIELD)
    @NotNull
    private Boolean isPeriodicAttachment;
}
