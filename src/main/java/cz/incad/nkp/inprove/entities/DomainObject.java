package cz.incad.nkp.inprove.entities;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.solr.core.mapping.Indexed;

import java.util.UUID;

@EqualsAndHashCode(of = "id")
@Getter
@Setter
public abstract class DomainObject {

    @Id
    @Indexed(name = "id", type = "string")
    protected String id = UUID.randomUUID().toString();

    @Override
    public String toString() {
        return getClass().getSimpleName() + "@" + id;
    }
}
