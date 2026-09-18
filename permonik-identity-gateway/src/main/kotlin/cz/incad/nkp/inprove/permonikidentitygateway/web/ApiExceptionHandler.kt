package cz.incad.nkp.inprove.permonikidentitygateway.web

import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class ApiExceptionHandler {
    @ExceptionHandler(BadCredentialsException::class)
    fun unauthorized(): ResponseEntity<Void> =
        ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

    @ExceptionHandler(DataIntegrityViolationException::class)
    fun conflict(): ResponseEntity<Void> = ResponseEntity.status(HttpStatus.CONFLICT).build()
}
