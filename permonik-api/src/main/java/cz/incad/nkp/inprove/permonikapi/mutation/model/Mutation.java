package cz.incad.nkp.inprove.permonikapi.mutation.model;


import cz.incad.nkp.inprove.permonikapi.audit.Auditable;
import lombok.*;
import org.apache.solr.client.solrj.beans.Field;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Setter
@Getter
public class Mutation extends Auditable {

    @Field
    private String id; // UUID

    // as string
    //    {
//        cs: "Brno",
//        sk: "Brno",
//        en: "Brno"
//    }
    @Field
    private String name;


}
