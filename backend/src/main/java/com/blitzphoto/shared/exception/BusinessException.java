package com.blitzphoto.shared.exception;

/**
 * Base exception for business logic violations.
 * 
 * This exception should be thrown when business rules are violated.
 * It will be caught by GlobalExceptionHandler and returned as a 400 Bad Request.
 */
public class BusinessException extends RuntimeException {

    private final String errorCode;

    public BusinessException(String message) {
        super(message);
        this.errorCode = "BUSINESS_ERROR";
    }

    public BusinessException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "BUSINESS_ERROR";
    }

    public String getErrorCode() {
        return errorCode;
    }
}

