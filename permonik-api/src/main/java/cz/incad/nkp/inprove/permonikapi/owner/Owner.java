package cz.incad.nkp.inprove.permonikapi.owner;

import static cz.incad.nkp.inprove.permonikapi.owner.OwnerDefinition.*;

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
public class Owner extends Auditable {

    @Field(ID_FIELD)
    @NotNull
    private String id; // UUID

    @Field(NAME_FIELD)
    @NotNull
    private String name;

    @Field(SHORTHAND_FIELD)
    @NotNull
    private String shorthand;

    @Field(SIGLA_FIELD)
    @NotNull
    private String sigla;
}
