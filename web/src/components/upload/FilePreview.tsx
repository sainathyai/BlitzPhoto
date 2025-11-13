import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatFileSize } from '../../lib/utils';

interface FilePreviewProps {
  file: File;
  onRemove?: () => void;
  status?: 'pending' | 'uploading' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  compact?: boolean;
}

/**
 * FilePreview Component
 * 
 * Displays file preview with thumbnail, name, size, and status.
 */
export default function FilePreview({
  file,
  onRemove,
  status = 'pending',
  progress = 0,
  error,
  compact = false,
}: FilePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);

  // Generate preview for images
  useEffect(() => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [file]);

  // Compact grid layout
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative group"
      >
        <div className="relative aspect-square rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50 hover:border-primary-300 transition-colors">
          {/* Thumbnail */}
          {preview ? (
            <img
              src={preview}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Remove Button */}
          {onRemove && status !== 'uploading' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute top-1 right-1 p-1 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
              aria-label="Remove file"
            >
              <svg
                className="w-4 h-4 text-neutral-600 hover:text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {/* Status Overlay */}
          {status === 'uploading' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
          {status === 'completed' && (
            <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
              ✓
            </div>
          )}
          {status === 'failed' && (
            <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              ✗
            </div>
          )}
        </div>

        {/* Filename below */}
        <div className="mt-2">
          <p className="text-xs font-medium text-neutral-900 truncate" title={file.name}>
            {file.name}
          </p>
          <p className="text-xs text-neutral-500">
            {status === 'pending' && 'Waiting...'}
            {status === 'uploading' && `${progress}%`}
            {status === 'completed' && 'Done'}
            {status === 'failed' && 'Failed'}
          </p>
        </div>
      </motion.div>
    );
  }

  // Original list layout
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start space-x-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          {preview ? (
            <img
              src={preview}
              alt={file.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatFileSize(file.size)}
          </p>

          {/* Status */}
          <div className="mt-2">
            {status === 'uploading' && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
            {status === 'completed' && (
              <p className="text-xs text-green-600">✓ Uploaded</p>
            )}
            {status === 'failed' && (
              <p className="text-xs text-red-600">
                ✗ Failed: {error || 'Unknown error'}
              </p>
            )}
            {status === 'pending' && (
              <p className="text-xs text-gray-500">Waiting to upload...</p>
            )}
          </div>
        </div>

        {/* Remove Button */}
        {onRemove && status !== 'uploading' && (
          <button
            onClick={onRemove}
            className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
            aria-label="Remove file"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
}

