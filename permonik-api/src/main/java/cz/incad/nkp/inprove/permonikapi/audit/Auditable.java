package cz.incad.nkp.inprove.permonikapi.audit;

import cz.incad.nkp.inprove.permonikapi.user.User;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.apache.solr.client.solrj.beans.Field;
import org.hibernate.envers.Audited;

import java.time.LocalDateTime;
import java.util.Objects;

import static cz.incad.nkp.inprove.permonikapi.config.security.user.UserProducer.getCurrentUser;

@MappedSuperclass
@Audited
@Getter
@Setter
@ToString
public class Auditable {

    @Field
    private String created;

    @Field
    private String createdBy;

    @Field
    private String updated;

    @Field
    private String updatedBy;

    @Field
    private String deleted;

    @Field
    private String deletedBy;

    @PrePersist
    public void prePersist() {
        User currentUser = Objects.requireNonNull(getCurrentUser(), "User must be logged in");

        created = LocalDateTime.now().toString();
        createdBy = currentUser.getId();
    }

    @PreUpdate
    public void preUpdate() {
        User currentUser = Objects.requireNonNull(getCurrentUser(), "User must be logged in");

        updated = LocalDateTime.now().toString();
        updatedBy = currentUser.getId();
    }

    @PreRemove
    public void preRemove() {
        User currentUser = Objects.requireNonNull(getCurrentUser(), "User must be logged in");

        deleted = LocalDateTime.now().toString();
        deletedBy = currentUser.getId();
    }
}
