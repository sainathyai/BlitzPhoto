import { motion, AnimatePresence } from 'framer-motion';
import type { FileValidationError } from '../../hooks/useFileValidation';

interface UploadValidationProps {
  errors: FileValidationError[];
}

/**
 * UploadValidation Component
 * 
 * Displays validation errors for file uploads.
 */
export default function UploadValidation({ errors }: UploadValidationProps) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-red-50 border border-red-200 rounded-lg p-4"
      >
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-red-600 mt-0.5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-red-800 mb-2">
              Validation Errors
            </h4>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-sm text-red-700">
                  <span className="font-medium">{error.fileName}:</span>{' '}
                  {error.error}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

