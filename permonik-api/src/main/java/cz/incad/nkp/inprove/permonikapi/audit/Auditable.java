package cz.incad.nkp.inprove.permonikapi.audit;

import cz.incad.nkp.inprove.permonikapi.user.User;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.apache.solr.client.solrj.beans.Field;

import java.time.Instant;
import java.util.Objects;

import static cz.incad.nkp.inprove.permonikapi.config.security.user.UserProducer.getCurrentUser;


@Getter
@Setter
@ToString
public class Auditable implements AuditableDefinition {

    @Field(CREATED_FIELD)
    private Instant created;

    @Field(CREATED_BY_FIELD)
    private String createdBy;

    @Field(UPDATED_FIELD)
    private Instant updated;

    @Field(UPDATED_BY_FIELD)
    private String updatedBy;

    @Field(DELETED_FIELD)
    private Instant deleted;

    @Field(DELETED_BY_FIELD)
    private String deletedBy;

    public void prePersist() {
        User currentUser = Objects.requireNonNull(getCurrentUser(), "User must be logged in");

        created = Instant.now();
        createdBy = currentUser.getId();
    }

    public void preUpdate() {
        User currentUser = Objects.requireNonNull(getCurrentUser(), "User must be logged in");

        updated = Instant.now();
        updatedBy = currentUser.getId();
    }

    public void preRemove() {
        User currentUser = Objects.requireNonNull(getCurrentUser(), "User must be logged in");

        deleted = Instant.now();
        deletedBy = currentUser.getId();
    }
}
