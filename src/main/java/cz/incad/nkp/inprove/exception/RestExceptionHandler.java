package cz.incad.nkp.inprove.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.ws.rs.BadRequestException;
import javax.ws.rs.ForbiddenException;
import javax.ws.rs.NotFoundException;
import java.time.LocalDateTime;
import java.util.*;

@RestControllerAdvice
public class RestExceptionHandler {

    Map<Class<? extends Exception>, HttpStatus> exceptions = new HashMap<>();

    public RestExceptionHandler() {
        exceptions.put(IllegalArgumentException.class, HttpStatus.BAD_REQUEST);
        exceptions.put(BadRequestException.class, HttpStatus.BAD_REQUEST);
        exceptions.put(ForbiddenException.class, HttpStatus.FORBIDDEN);
        exceptions.put(NotFoundException.class, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler({IllegalArgumentException.class, BadRequestException.class,
            ForbiddenException.class, NotFoundException.class})
    public ResponseEntity<Map<String, Object>> exception(Exception exception) {
        HttpStatus httpStatus = exceptions.get(exception.getClass());
        return createResponse(exception, httpStatus);
    }

    private ResponseEntity<Map<String, Object>> createResponse(Exception exception, HttpStatus httpStatus) {
        Map<String, Object> body = new HashMap<>();
        body.put("time", LocalDateTime.now().toString());
        body.put("exception", exception.getClass().getCanonicalName());
        body.put("status", httpStatus.value());
        body.put("error", httpStatus.getReasonPhrase());
        body.put("message", exception.getMessage());

        return ResponseEntity.status(httpStatus).body(body);
    }
}