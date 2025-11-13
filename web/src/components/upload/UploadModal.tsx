import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import FileList from './FileList';
import UploadButton from './UploadButton';
import UploadValidation from './UploadValidation';
import type { FileValidationError } from '../../hooks/useFileValidation';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFiles: File[];
  onRemoveFile: (file: File) => void;
  onUpload: () => void;
  validationErrors: FileValidationError[];
  isUploading: boolean;
  maxFiles: number;
}

/**
 * UploadModal Component
 * 
 * Modal dialog for managing selected files before upload.
 * Displays files in a compact grid layout.
 */
export default function UploadModal({
  isOpen,
  onClose,
  selectedFiles,
  onRemoveFile,
  onUpload,
  validationErrors,
  isUploading,
  maxFiles,
}: UploadModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">
                    Upload Photos
                  </h2>
                  <p className="text-sm text-neutral-500 mt-1">
                    {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-neutral-600" />
                </button>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="p-4 border-b border-neutral-200">
                  <UploadValidation errors={validationErrors} />
                </div>
              )}

              {/* File Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                <FileList
                  files={selectedFiles}
                  onRemove={onRemoveFile}
                  compact={true}
                />
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-neutral-200 flex items-center justify-between gap-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <UploadButton
                  onClick={onUpload}
                  disabled={isUploading || validationErrors.length > 0}
                  loading={isUploading}
                  fileCount={selectedFiles.length}
                  maxFiles={maxFiles}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

