import { useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface UploadTileProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  maxFiles?: number;
}

/**
 * UploadTile Component
 * 
 * Upload tile that appears as the first item in the photo gallery grid.
 */
export default function UploadTile({
  onFilesSelected,
  disabled = false,
  maxFiles = 10000,
}: UploadTileProps) {
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

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { ref, ...rootProps } = getRootProps();

  return (
    <div
      ref={ref}
      {...rootProps}
      className={cn(
        'relative aspect-square overflow-hidden rounded-xl bg-white border border-neutral-200 shadow-sm transition-all duration-300 cursor-pointer group',
        'hover:shadow-xl hover:border-primary-300',
        isDragActive
          ? 'border-primary bg-primary-50 scale-[1.02] shadow-lg'
          : 'border-neutral-200',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={handleClick}
    >
      <input {...getInputProps()} ref={fileInputRef} />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
        <div className="mb-2">
          <AnimatePresence mode="wait">
            {isDragActive ? (
              <motion.div
                key="active"
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1.1, rotate: 5 }}
                exit={{ opacity: 0, scale: 0.8, rotate: -5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Sparkles className="w-8 h-8 text-primary" />
              </motion.div>
            ) : (
              <motion.div
                key="inactive"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <ImageIcon className="w-8 h-8 text-neutral-400 group-hover:text-primary transition-colors" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <p className={cn(
          'text-xs font-semibold mb-0.5',
          isDragActive ? 'text-primary-700' : 'text-neutral-700 group-hover:text-primary transition-colors'
        )}>
          Upload Photos
        </p>
        <p className="text-[10px] text-neutral-500">
          {isDragActive ? 'Drop here' : 'Click or drag'}
        </p>
      </div>
    </div>
  );
}

