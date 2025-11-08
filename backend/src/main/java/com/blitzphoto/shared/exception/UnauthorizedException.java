package com.blitzphoto.shared.exception;

/**
 * Exception thrown when authentication fails or is invalid.
 * 
 * Will be mapped to 401 Unauthorized by GlobalExceptionHandler.
 */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }

    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}

