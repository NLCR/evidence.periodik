package cz.incad.nkp.inprove.permonikidentitygateway.identity

import com.fasterxml.jackson.annotation.JsonValue

enum class UserRole(@get:JsonValue val value: String) {
    USER("user"),
    ADMIN("admin"),
    DIGITALIZATION("digitalization");

    val permissions: Set<Permission>
        get() =
            when (this) {
                ADMIN -> Permission.entries.toSet()
                USER ->
                    setOf(
                        Permission.VOLUME_WRITE,
                        Permission.VOLUME_DELETE,
                        Permission.SPECIMEN_DELETE,
                        Permission.TEMPLATE_MANAGE,
                    )
                DIGITALIZATION -> setOf(Permission.TEMPLATE_MANAGE)
            }
}

fun String.toUserRole(): UserRole =
    UserRole.entries.firstOrNull { it.value.equals(this, ignoreCase = true) }
        ?: throw IllegalArgumentException("Unsupported role: $this")
