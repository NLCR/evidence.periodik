package cz.incad.nkp.inprove.permonikexportapi.core

import java.time.Duration
import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties("permonik.core-export.grpc")
class CoreExportClientProperties(val token: String, val target: String, val deadline: Duration) {
    init {
        require(token.matches(Regex("[0-9a-fA-F]{64}"))) {
            "CORE_EXPORT_GRPC_TOKEN must contain 64 random hexadecimal characters"
        }
        require(target.isNotBlank()) { "Core gRPC target is required" }
        require(deadline > Duration.ZERO && deadline <= Duration.ofMinutes(5)) {
            "Core gRPC deadline must be positive and at most five minutes"
        }
    }
}
