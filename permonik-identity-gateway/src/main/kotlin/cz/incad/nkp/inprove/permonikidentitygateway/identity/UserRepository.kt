package cz.incad.nkp.inprove.permonikidentitygateway.identity

import java.util.UUID
import org.springframework.data.jdbc.repository.query.Query
import org.springframework.data.repository.CrudRepository

interface UserRepository : CrudRepository<UserEntity, UUID> {
    @Query("SELECT * FROM identity_user WHERE LOWER(username) = LOWER(:username)")
    fun findByUsernameIgnoreCase(username: String): UserEntity?

    fun findBySamlIdpEntityIdAndSamlEppn(samlIdpEntityId: String, samlEppn: String): UserEntity?
}
