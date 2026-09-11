package cz.incad.nkp.inprove.permonikapi.metaTitle;

import cz.incad.nkp.inprove.permonikapi.audit.Auditable;
import lombok.*;
import org.apache.solr.client.solrj.beans.Field;
import jakarta.validation.constraints.NotNull;
import org.jspecify.annotations.Nullable;

import static cz.incad.nkp.inprove.permonikapi.metaTitle.MetaTitleDefinition.*;

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
