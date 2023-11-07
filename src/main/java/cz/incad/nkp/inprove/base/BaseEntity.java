package cz.incad.nkp.inprove.base;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.solr.core.mapping.Indexed;

import java.util.UUID;

@EqualsAndHashCode(of = "id")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public abstract class BaseEntity {

    @Id
    @Indexed(name = "id", type = "string")
    protected String id = UUID.randomUUID().toString();

    @Override
    public String toString() {
        return getClass().getSimpleName() + "@" + id;
    }
}
