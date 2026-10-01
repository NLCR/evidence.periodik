package cz.incad.nkp.inprove.permonikapi.mutation.model;

import static cz.incad.nkp.inprove.permonikapi.mutation.model.MutationDefinition.*;

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
public class Mutation extends Auditable {

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
}
