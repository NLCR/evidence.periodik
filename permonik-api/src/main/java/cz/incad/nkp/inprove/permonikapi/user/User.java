package cz.incad.nkp.inprove.permonikapi.user;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.apache.solr.client.solrj.beans.Field;

import java.io.Serializable;
import java.util.List;

import static cz.incad.nkp.inprove.permonikapi.user.UserDefinition.*;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@ToString
@Setter
@Getter
@SuperBuilder
public class User implements Serializable {

    @Field(ID_FIELD)
    private String id;

    @Field(EMAIL_FIELD)
    private String email;

    @Field(USERNAME_FIELD)
    private String userName;

    @Field(FIRST_NAME_FIELD)
    private String firstName;

    @Field(LAST_NAME_FIELD)
    private String lastName;

    @Field(ROLE_FIELD)
    private String role;

    @Field(ACTIVE_FIELD)
    private Boolean active;

    @Field(OWNERS_FIELD)
    private List<String> owners;

    @Field(PASSWORD_FIELD)
    private String password;

}
