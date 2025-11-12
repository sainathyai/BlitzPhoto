import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface UploadButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  fileCount?: number;
  maxFiles?: number;
}

/**
 * UploadButton Component
 * 
 * Button for initiating upload with loading state and file count validation.
 */
export default function UploadButton({
  onClick,
  disabled = false,
  loading = false,
  fileCount = 0,
  maxFiles = 10000, // Effectively unlimited
}: UploadButtonProps) {
  const isDisabled = disabled || loading || fileCount === 0 || fileCount > maxFiles;

  return (
    <motion.button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'px-6 py-3 rounded-lg font-medium text-white transition-colors',
        isDisabled
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-primary hover:bg-primary-dark',
        loading && 'opacity-75'
      )}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
    >
      {loading ? (
        <span className="flex items-center space-x-2">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Uploading...</span>
        </span>
      ) : (
        <span>Upload {fileCount > 0 ? `${fileCount} File${fileCount > 1 ? 's' : ''}` : 'Files'}</span>
      )}
    </motion.button>
  );
}

