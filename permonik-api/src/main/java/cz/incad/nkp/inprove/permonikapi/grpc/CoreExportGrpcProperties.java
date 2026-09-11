package cz.incad.nkp.inprove.permonikapi.grpc;

import org.jspecify.annotations.NonNull;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("permonik.core-export.grpc")
public record CoreExportGrpcProperties(String token, int maxResponseBytes) {
    /** Requires an explicit random hex credential and a positive protobuf response budget. */
    public CoreExportGrpcProperties {
        if (token == null || !token.matches("[0-9a-fA-F]{64}")) {
            throw new IllegalArgumentException("CORE_EXPORT_GRPC_TOKEN must contain 64 random hexadecimal characters");
        }
        if (maxResponseBytes <= 0) throw new IllegalArgumentException("max-response-bytes must be positive");
    }

    /** Prevents accidental credential disclosure through configuration logging. */
    @Override public @NonNull String toString() { return "CoreExportGrpcProperties[token=REDACTED]"; }
}
