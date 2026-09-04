package cz.incad.nkp.inprove.permonikidentitygateway.identity

import java.util.UUID
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.Transient
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.MappedCollection
import org.springframework.data.relational.core.mapping.Table
import org.springframework.data.relational.core.mapping.event.BeforeConvertCallback
import org.springframework.stereotype.Component

@Table("identity_user")
data class UserEntity(
    @Id @Column("id") val id: UUID? = null,
    val username: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val role: UserRole,
    val active: Boolean,
    val passwordHash: String? = null,
    val samlIdpEntityId: String? = null,
    val samlEppn: String? = null,
    @MappedCollection(idColumn = "user_id")
    private val ownerEntries: Set<UserOwner> = emptySet(),
) {
    @get:Transient
    val owners: Set<String>
        get() = ownerEntries.mapTo(linkedSetOf()) { it.ownerId }

    fun withOwners(owners: Collection<String>) = copy(ownerEntries = owners.mapTo(linkedSetOf(), ::UserOwner))

    override fun toString() = "UserEntity(id=$id, username=$username, role=$role, active=$active)"
}

@Component
class UserIdGenerator : BeforeConvertCallback<UserEntity> {
    override fun onBeforeConvert(entity: UserEntity): UserEntity =
        if (entity.id == null) entity.copy(id = UUID.randomUUID()) else entity
}

@Table("identity_user_owner")
data class UserOwner(
    @Id
    @Column("owner_id")
    val ownerId: String,
)
