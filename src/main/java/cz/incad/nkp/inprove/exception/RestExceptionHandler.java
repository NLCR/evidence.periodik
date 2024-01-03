package cz.incad.nkp.inprove.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.ws.rs.BadRequestException;
import javax.ws.rs.ForbiddenException;
import javax.ws.rs.NotFoundException;
import java.time.LocalDateTime;
import java.util.*;

import static org.springframework.http.HttpStatus.*;

@RestControllerAdvice
@Slf4j
public class RestExceptionHandler {

    Map<Class<? extends Exception>, HttpStatus> exceptions = new HashMap<>();

    public RestExceptionHandler() {
        exceptions.put(IllegalArgumentException.class, BAD_REQUEST);
        exceptions.put(BadRequestException.class, BAD_REQUEST);
        exceptions.put(ForbiddenException.class, FORBIDDEN);
        exceptions.put(NotFoundException.class, NOT_FOUND);
        exceptions.put(AccessDeniedException.class, FORBIDDEN);
    }

    @ExceptionHandler({
            IllegalArgumentException.class, BadRequestException.class,
            ForbiddenException.class, NotFoundException.class,
            AccessDeniedException.class})
    public ResponseEntity<Map<String, Object>> handleExceptions(Exception exception) {
        return createResponse(exception);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleNotRecognizedException(Exception exception) {
        log.error("Not specified exception in GlobalExceptionHandler: ", exception);
        return createResponse(exception);
    }

    private ResponseEntity<Map<String, Object>> createResponse(Exception exception) {
        HttpStatus status = exceptions.getOrDefault(exception.getClass(), INTERNAL_SERVER_ERROR);

        Map<String, Object> body = new HashMap<>();
        body.put("time", LocalDateTime.now().toString());
        body.put("exception", exception.getClass().getCanonicalName());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", exception.getMessage());

        return ResponseEntity.status(status).body(body);
    }
}