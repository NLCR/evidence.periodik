package cz.incad.nkp.inprove.permonikidentitygateway.identity;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByUsernameIgnoreCase(String username);
    Optional<UserEntity> findBySamlIdpEntityIdAndSamlEppn(String samlIdpEntityId, String samlEppn);
}
