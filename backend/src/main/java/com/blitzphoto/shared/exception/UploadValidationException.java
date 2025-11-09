package com.blitzphoto.shared.exception;

/**
 * Exception thrown when upload validation fails.
 * 
 * This exception is specifically for upload validation errors.
 */
public class UploadValidationException extends BusinessException {

    public UploadValidationException(String message) {
        super(message, "UPLOAD_VALIDATION_ERROR");
    }

    public UploadValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}

