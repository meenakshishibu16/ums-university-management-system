package com.ums.exception;

import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import jakarta.validation.ConstraintViolationException;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Exception> {

    @Override
    public Response toResponse(Exception e) {
        Map<String, Object> error = new HashMap<>();

        if (e instanceof ConstraintViolationException cve) {
            error.put("message", "Validation failed");
            error.put("errors", cve.getConstraintViolations().stream()
                    .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                    .collect(Collectors.toList()));
            return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
        }

        error.put("message", e.getMessage() != null ? e.getMessage() : "Internal Server Error");
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
    }
}
