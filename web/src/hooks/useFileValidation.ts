import { env } from '../config/env';
import { isValidFileType, isValidFileSize } from '../lib/utils';

export interface FileValidationError {
  fileName: string;
  error: string;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: FileValidationError[];
}

/**
 * useFileValidation Hook
 * 
 * Validates files according to business rules.
 */
export function useFileValidation() {
  const validateFile = (file: File): FileValidationError | null => {
    // Validate file type
    if (!isValidFileType(file, [...env.upload.allowedMimeTypes])) {
      return {
        fileName: file.name,
        error: `File type ${file.type} is not allowed. Allowed types: ${env.upload.allowedMimeTypes.join(', ')}`,
      };
    }

    // Validate file size
    if (!isValidFileSize(file, env.upload.maxFileSize)) {
      return {
        fileName: file.name,
        error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${env.upload.maxFileSize / 1024 / 1024}MB`,
      };
    }

    return null;
  };

  const validateFiles = (files: File[], existingCount = 0): FileValidationResult => {
    const errors: FileValidationError[] = [];

    // Validate file count
    const totalCount = existingCount + files.length;
    if (totalCount > env.upload.maxFiles) {
      errors.push({
        fileName: 'Batch',
        error: `Cannot upload more than ${env.upload.maxFiles} files at once. Selected: ${totalCount}`,
      });
      return { isValid: false, errors };
    }

    // Validate each file
    files.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  return {
    validateFile,
    validateFiles,
  };
}

