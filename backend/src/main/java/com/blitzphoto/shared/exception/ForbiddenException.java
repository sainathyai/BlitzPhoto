package com.blitzphoto.shared.exception;

/**
 * Exception thrown when a user lacks permission for an operation.
 * 
 * Will be mapped to 403 Forbidden by GlobalExceptionHandler.
 */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }

    public ForbiddenException(String message, Throwable cause) {
        super(message, cause);
    }
}

