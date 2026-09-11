package cz.incad.nkp.inprove.permonikexportapi.config

import cz.incad.nkp.inprove.permonikexportapi.template.FinalizedTemplateNotFoundException
import cz.incad.nkp.inprove.permonikexportapi.template.InvalidTemplateException
import cz.incad.nkp.inprove.permonikexportapi.template.StateConflictException
import cz.incad.nkp.inprove.permonikexportapi.template.TemplateNotFoundException
import cz.incad.nkp.inprove.permonikexportapi.template.TemplateValidationException
import cz.incad.nkp.inprove.permonikexportapi.template.TemplateViolation
import cz.incad.nkp.inprove.permonikexportapi.template.VersionConflictException
import org.springframework.http.HttpStatus
import org.springframework.http.ProblemDetail
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class ApiExceptionHandler {
    /** Converts missing active or finalized templates into an HTTP 404 problem response. */
    @ExceptionHandler(TemplateNotFoundException::class, FinalizedTemplateNotFoundException::class)
    fun notFound(exception: RuntimeException): ProblemDetail =
        ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.message.orEmpty())

    /** Converts malformed domain input into an HTTP 400 problem response. */
    @ExceptionHandler(InvalidTemplateException::class)
    fun badRequest(exception: InvalidTemplateException): ProblemDetail =
        ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, exception.message.orEmpty())

    /** Converts optimistic-lock and state-transition conflicts into HTTP 409 problem responses. */
    @ExceptionHandler(VersionConflictException::class, StateConflictException::class)
    fun conflict(exception: RuntimeException): ProblemDetail =
        ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, exception.message.orEmpty())

    /** Returns stable violation codes and paths when a requested target state cannot be reached. */
    @ExceptionHandler(TemplateValidationException::class)
    @ResponseStatus(HttpStatus.UNPROCESSABLE_CONTENT)
    fun validation(exception: TemplateValidationException) = TemplateValidationFailure(
        violations = exception.violations,
    )
}

data class TemplateValidationFailure(
    val code: String = "TEMPLATE_VALIDATION_FAILED",
    val violations: List<TemplateViolation>,
)
