package cz.incad.nkp.inprove.permonikidentitygateway.identity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.EnumSet;
import java.util.Set;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
public enum UserRole {
    USER("user"),
    ADMIN("admin"),
    DIGITALIZATION("digitalization");

    private final String value;

    @JsonCreator
    public static UserRole fromValue(String value) {
        for (UserRole role : values()) {
            if (role.value.equalsIgnoreCase(value)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Unsupported role: " + value);
    }

    @JsonValue
    public String value() {
        return value;
    }

    public Set<Permission> permissions() {
        return switch (this) {
            case USER -> Set.of();
            case ADMIN -> EnumSet.allOf(Permission.class);
            case DIGITALIZATION -> EnumSet.of(Permission.TEMPLATE_READ, Permission.TEMPLATE_WRITE,
                    Permission.TEMPLATE_FINALIZE, Permission.TEMPLATE_DELETE, Permission.TEMPLATE_PLAN);
        };
    }

    @Converter(autoApply = true)
    public static class JpaConverter implements AttributeConverter<UserRole, String> {
        @Override
        public String convertToDatabaseColumn(UserRole role) {
            return role == null ? null : role.value;
        }

        @Override
        public UserRole convertToEntityAttribute(String value) {
            return value == null ? null : fromValue(value);
        }
    }
}
