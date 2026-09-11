package cz.incad.nkp.inprove.permonikexportapi.template

class TemplateNotFoundException(volumeId: String) : RuntimeException("Template for volume $volumeId was not found")

class FinalizedTemplateNotFoundException(barcode: String) : RuntimeException(
    "Finalized template for barcode $barcode was not found",
)

class VersionConflictException : RuntimeException("Template version does not match")

class StateConflictException(current: TemplateState, target: TemplateState) : RuntimeException(
    "Template cannot transition from $current to $target",
)

class InvalidTemplateException(message: String) : RuntimeException(message)

data class TemplateViolation(val path: String, val code: String)

class TemplateValidationException(val violations: List<TemplateViolation>) : RuntimeException(
    "Template does not satisfy target state requirements",
)
