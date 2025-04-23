package cz.incad.nkp.inprove.permonikapi.metaTitle;

import cz.incad.nkp.inprove.permonikapi.audit.Auditable;
import lombok.*;
import org.apache.solr.client.solrj.beans.Field;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Setter
@Getter
public class MetaTitle extends Auditable {

    @Field
    private String id; // UUID
    @Field
    private String name;
    @Field
    private String note;
    @Field
    private Boolean isPublic;

    // Custom getter for `note`
    public String getNote() {
        return note == null ? "" : note;
    }

}
