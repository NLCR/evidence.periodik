package cz.incad.nkp.inprove.permonikapi.audit;

import cz.incad.nkp.inprove.permonikapi.config.security.CurrentIdentity;
import cz.incad.nkp.inprove.permonikapi.config.security.InternalPrincipal;
import jakarta.validation.constraints.NotNull;
import java.util.Date;
import java.util.Objects;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.apache.solr.client.solrj.beans.Field;
import org.jspecify.annotations.Nullable;

@Getter
@Setter
@ToString
public class Auditable implements AuditableDefinition {

    @Field(CREATED_FIELD)
    @NotNull(groups = StoredDocument.class)
    private Date created;

    @Field(CREATED_BY_FIELD)
    @NotNull(groups = StoredDocument.class)
    private String createdBy;

    @Field(UPDATED_FIELD)
    private @Nullable Date updated;

    @Field(UPDATED_BY_FIELD)
    private @Nullable String updatedBy;

    @Field(DELETED_FIELD)
    private @Nullable Date deleted;

    @Field(DELETED_BY_FIELD)
    private @Nullable String deletedBy;

    public void prePersist() {
        InternalPrincipal currentUser =
                Objects.requireNonNull(CurrentIdentity.get(), "User must be logged in");

        created = new Date();
        createdBy = currentUser.id();
    }

    public void preUpdate() {
        InternalPrincipal currentUser =
                Objects.requireNonNull(CurrentIdentity.get(), "User must be logged in");

        updated = new Date();
        updatedBy = currentUser.id();
    }

    public void preRemove() {
        InternalPrincipal currentUser =
                Objects.requireNonNull(CurrentIdentity.get(), "User must be logged in");

        deleted = new Date();
        deletedBy = currentUser.id();
    }
}
