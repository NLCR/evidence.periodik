package cz.incad.nkp.inprove.permonikapi.owner;


import cz.incad.nkp.inprove.permonikapi.audit.Auditable;
import lombok.*;
import org.apache.solr.client.solrj.beans.Field;

import static cz.incad.nkp.inprove.permonikapi.owner.OwnerDefinition.*;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Setter
@Getter
public class Owner extends Auditable {

    @Field(ID_FIELD)
    private String id; // UUID

    @Field(NAME_FIELD)
    private String name;

    @Field(SHORTHAND_FIELD)
    private String shorthand;

    @Field(SIGLA_FIELD)
    private String sigla;
}
