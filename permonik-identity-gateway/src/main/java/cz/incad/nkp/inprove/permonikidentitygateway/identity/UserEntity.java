package cz.incad.nkp.inprove.permonikidentitygateway.identity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "identity_user")
@Getter
@Setter
public class UserEntity {
    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    @Convert(converter = UserRole.JpaConverter.class)
    private UserRole role;
    private boolean active;
    private String passwordHash;
    private String samlIdpEntityId;
    private String samlEppn;
    @ElementCollection
    @CollectionTable(name = "identity_user_owner", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "owner_id", nullable = false)
    private Set<String> owners = new LinkedHashSet<>();
}
