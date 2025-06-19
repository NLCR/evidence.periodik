package cz.incad.nkp.inprove.permonikapi.user;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.apache.solr.client.solrj.beans.Field;

import java.io.Serializable;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@ToString
@Setter
@Getter
@SuperBuilder
public class User implements Serializable {

    @Field()
    private String id;

    @Field()
    private String email;

    @Field()
    private String userName;

    @Field()
    private String firstName;

    @Field()
    private String lastName;

    @Field()
    private String role;

    @Field()
    private Boolean active;

    @Field()
    private List<String> owners;

    @Field()
    private String password;

}
