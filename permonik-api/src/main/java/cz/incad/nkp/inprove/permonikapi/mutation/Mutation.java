package cz.incad.nkp.inprove.permonikapi.mutation;


import lombok.*;
import org.apache.solr.client.solrj.beans.Field;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@ToString
@Setter
@Getter
public class Mutation {

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
