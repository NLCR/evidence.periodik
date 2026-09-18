package cz.incad.nkp.inprove.permonikidentitygateway.identity

import com.fasterxml.jackson.annotation.JsonValue

enum class UserRole(@get:JsonValue val value: String) {
    USER("user"),
    ADMIN("admin"),
    DIGITALIZATION("digitalization");

    val permissions: Set<Permission>
        get() =
            when (this) {
                USER -> emptySet()
                ADMIN -> Permission.entries.toSet()
                DIGITALIZATION -> setOf(Permission.TEMPLATE_MANAGE)
            }
}

fun String.toUserRole(): UserRole =
    UserRole.entries.firstOrNull { it.value.equals(this, ignoreCase = true) }
        ?: throw IllegalArgumentException("Unsupported role: $this")
