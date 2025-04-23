package cz.incad.nkp.inprove.permonikapi.edition;


import cz.incad.nkp.inprove.permonikapi.audit.Auditable;
import lombok.*;
import org.apache.solr.client.solrj.beans.Field;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Setter
@Getter
public class Edition extends Auditable {

    @Field
    private String id; // UUID

    // as string
    //    {
//        cs: "Ranní",
//        sk: "Ranné",
//        en: "Morning"
//    }
    @Field
    private String name;

    @Field
    private Boolean isDefault;

    @Field
    private Boolean isAttachment;

    @Field
    private Boolean isPeriodicAttachment;
}
