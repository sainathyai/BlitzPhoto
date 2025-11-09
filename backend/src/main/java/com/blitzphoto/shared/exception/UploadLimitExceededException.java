package com.blitzphoto.shared.exception;

/**
 * Exception thrown when upload limits are exceeded.
 * 
 * This exception is for file count, file size, or total size limit violations.
 */
public class UploadLimitExceededException extends BusinessException {

    public UploadLimitExceededException(String message) {
        super(message, "UPLOAD_LIMIT_EXCEEDED");
    }

    public UploadLimitExceededException(String message, Throwable cause) {
        super(message, cause);
    }
}

