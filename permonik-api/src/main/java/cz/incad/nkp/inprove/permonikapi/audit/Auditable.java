package cz.incad.nkp.inprove.permonikapi.audit;

import cz.incad.nkp.inprove.permonikapi.user.User;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.apache.solr.client.solrj.beans.Field;

import java.util.Date;
import java.util.Objects;

import static cz.incad.nkp.inprove.permonikapi.config.security.user.UserProducer.getCurrentUser;


@Getter
@Setter
@ToString
public class Auditable implements AuditableDefinition {

    @Field(CREATED_FIELD)
    private Date created;

    @Field(CREATED_BY_FIELD)
    private String createdBy;

    @Field(UPDATED_FIELD)
    private Date updated;

    @Field(UPDATED_BY_FIELD)
    private String updatedBy;

    @Field(DELETED_FIELD)
    private Date deleted;

    @Field(DELETED_BY_FIELD)
    private String deletedBy;

    public void prePersist() {
        User currentUser = Objects.requireNonNull(getCurrentUser(), "User must be logged in");

        created = new Date();
        createdBy = currentUser.getId();
    }

    public void preUpdate() {
        User currentUser = Objects.requireNonNull(getCurrentUser(), "User must be logged in");

        updated = new Date();
        updatedBy = currentUser.getId();
    }

    public void preRemove() {
        User currentUser = Objects.requireNonNull(getCurrentUser(), "User must be logged in");

        deleted = new Date();
        deletedBy = currentUser.getId();
    }
}
