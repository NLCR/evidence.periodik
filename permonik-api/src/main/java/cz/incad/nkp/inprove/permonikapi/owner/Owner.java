package cz.incad.nkp.inprove.permonikapi.owner;


import cz.incad.nkp.inprove.permonikapi.audit.Auditable;
import lombok.*;
import org.apache.solr.client.solrj.beans.Field;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Setter
@Getter
public class Owner extends Auditable {

    @Field
    private String id; // UUID

    @Field
    private String name;

    @Field
    private String shorthand;

    @Field
    private String sigla;
}
