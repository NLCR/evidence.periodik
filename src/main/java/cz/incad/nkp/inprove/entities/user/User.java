package cz.incad.nkp.inprove.entities.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import cz.incad.nkp.inprove.base.BaseEntity;
import lombok.*;
import org.springframework.data.solr.core.mapping.Indexed;
import org.springframework.data.solr.core.mapping.SolrDocument;

import java.io.Serializable;
import java.util.Date;

import static cz.incad.nkp.inprove.entities.user.User.COLLECTION;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SolrDocument(collection = COLLECTION)
public class User extends BaseEntity implements Serializable {

    public static final String COLLECTION = "user";

    @Indexed(name = "email", type = "string")
    private String email;

    @Indexed(name = "username", type = "string")
    private String username;

    @Indexed(name = "nazev", type = "string")
    private String nazev;

    @JsonIgnore
    @Indexed(name = "heslo", type = "string")
    private String heslo;

    @Indexed(name = "role", type = "string")
    private String role;

    @Indexed(name = "active", type = "boolean")
    private Boolean active;

    @Indexed(name = "poznamka", type = "string")
    private String poznamka;

    @Indexed(name = "owner", type = "string")
    private String owner;

    @Indexed(name = "indextime", type = "pdate")
    private Date indextime;
}
