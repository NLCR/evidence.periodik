package cz.incad.nkp.inprove.permonikapi.metaTitle;

import static cz.incad.nkp.inprove.permonikapi.metaTitle.MetaTitleDefinition.*;

import cz.incad.nkp.inprove.permonikapi.audit.Auditable;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.apache.solr.client.solrj.beans.Field;
import org.jspecify.annotations.Nullable;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Setter
@Getter
public class MetaTitle extends Auditable {

    @Field(ID_FIELD)
    @NotNull
    private String id; // UUID

    @Field(NAME_FIELD)
    @NotNull
    private String name;

    @Field(NOTE_FIELD)
    private @Nullable String note;

    @Field(IS_PUBLIC_FIELD)
    @NotNull
    private Boolean isPublic;

    // Custom getter for `note`
    public String getNote() {
        return note == null ? "" : note;
    }
}
