import { useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Upload, Image as ImageIcon, Sparkles } from 'lucide-react';

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  maxFiles?: number;
}

/**
 * UploadDropzone Component
 * 
 * Modern drag-and-drop zone with elevated card design and engaging visuals.
 */
export default function UploadDropzone({
  onFilesSelected,
  disabled = false,
  maxFiles = 10000, // Effectively unlimited
}: UploadDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!disabled && acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected, disabled]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/heic': ['.heic'],
      'image/webp': ['.webp'],
    },
    multiple: true,
    maxFiles,
  });

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const rootProps = getRootProps();

  return (
    <div
      {...rootProps}
      className={cn(
        'relative rounded-xl p-4 text-center cursor-pointer',
        'bg-neutral-50 border-2 border-dashed transition-all duration-300',
        'hover:border-primary-400 hover:bg-primary-50/50',
        isDragActive
          ? 'border-primary bg-primary-50 scale-[1.02] shadow-md'
          : 'border-neutral-300',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input {...getInputProps()} ref={fileInputRef} />
      
      <div className="space-y-3">
        {/* Compact Icon */}
        <motion.div
          animate={isDragActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative mx-auto w-12 h-12"
        >
          <div className={cn(
            'absolute inset-0 rounded-lg flex items-center justify-center',
            isDragActive 
              ? 'bg-gradient-to-br from-primary to-secondary' 
              : 'bg-gradient-to-br from-neutral-200 to-neutral-300'
          )}>
            <AnimatePresence mode="wait">
              {isDragActive ? (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="inactive"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <ImageIcon className="w-6 h-6 text-neutral-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Compact Text */}
        <div className="space-y-1">
          <p className={cn(
            'text-sm font-medium',
            isDragActive ? 'text-primary-700' : 'text-neutral-700'
          )}>
            {isDragActive ? 'Drop here' : 'Drag & drop'}
          </p>
          <p className="text-xs text-neutral-500">
            or click to browse
          </p>
        </div>

        {/* Compact Button */}
        <motion.button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleBrowseClick();
          }}
          disabled={disabled}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg',
            'bg-gradient-to-r from-primary to-primary-dark',
            'text-white text-sm font-medium shadow-sm',
            'hover:shadow-md transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Upload className="w-4 h-4" />
          <span>Browse</span>
        </motion.button>
      </div>
    </div>
  );
}

