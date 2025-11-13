import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import UploadModal from '../components/upload/UploadModal';
import UploadProgressPanel from '../components/upload/UploadProgressPanel';
import ChatWindow from '../components/chat/ChatWindow';
import { useFileUpload } from '../hooks/useFileUpload';
import { useFileValidation } from '../hooks/useFileValidation';
import { env } from '../config/env';
import PhotoGallery from '../components/gallery/PhotoGallery';
import { getFileKey } from '../lib/utils';
import type { FileValidationError } from '../hooks/useFileValidation';
import type { PhotoStatusResponse } from '../types/api.types';

/**
 * Dashboard Page
 * 
 * Main dashboard page with photo upload and gallery.
 */
export default function DashboardPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState<FileValidationError[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [optimisticPhotos, setOptimisticPhotos] = useState<PhotoStatusResponse[]>([]);
  const { validateFiles } = useFileValidation();
  const { uploadFiles, uploadStates, isUploading, clearUploads } = useFileUpload();

  // Open modal when files are selected
  useEffect(() => {
    if (selectedFiles.length > 0) {
      setIsModalOpen(true);
    }
  }, [selectedFiles.length]);

  const handleFilesSelected = useCallback((files: File[]) => {
    const validation = validateFiles(files, selectedFiles.length);

    if (validation.isValid) {
      setSelectedFiles((prev) => {
        const fileMap = new Map(prev.map((file) => [getFileKey(file), file]));
        files.forEach((file) => {
          fileMap.set(getFileKey(file), file);
        });
        return Array.from(fileMap.values());
      });
      setValidationErrors([]);
    } else {
      setValidationErrors(validation.errors);
    }
  }, [validateFiles, selectedFiles.length]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    // Optionally clear files when modal is closed
    // setSelectedFiles([]);
  }, []);

  const handleRemoveFile = useCallback((file: File) => {
    setSelectedFiles((prev) => {
      const newFiles = prev.filter((f) => getFileKey(f) !== getFileKey(file));
      // Close modal if no files left
      if (newFiles.length === 0) {
        setIsModalOpen(false);
      }
      return newFiles;
    });
  }, []);

  const handleUpload = useCallback(() => {
    if (selectedFiles.length > 0) {
      // Create optimistic photo entries immediately
      const optimistic: PhotoStatusResponse[] = selectedFiles.map((file, index) => {
        const photoId = `optimistic-${Date.now()}-${index}`;
        // Create a preview URL from the file
        const previewUrl = URL.createObjectURL(file);
        return {
          photoId,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          status: 'PROCESSING',
          s3Key: '', // Empty string for optimistic photos
          photoUrl: previewUrl, // Use local preview until API provides real URL
          errorMessage: null,
          uploadedAt: new Date().toISOString(),
          processedAt: null,
          createdAt: new Date().toISOString(),
        } as PhotoStatusResponse;
      });
      
      setOptimisticPhotos((prev) => [...optimistic, ...prev]);
      uploadFiles(selectedFiles);
      setSelectedFiles([]);
      setIsModalOpen(false);
    }
  }, [selectedFiles, uploadFiles]);

  // Clean up optimistic photos when API data loads (handled by PhotoGallery merge logic)
  // Also clean up old optimistic photos after 30 seconds as fallback
  useEffect(() => {
    const timer = setInterval(() => {
      setOptimisticPhotos((prev) => {
        const now = Date.now();
        return prev.filter((p) => {
          if (!p.photoId.startsWith('optimistic-')) return true;
          // Extract timestamp from optimistic photoId: optimistic-{timestamp}-{index}
          const match = p.photoId.match(/optimistic-(\d+)-/);
          if (match) {
            const photoTime = parseInt(match[1], 10);
            // Keep if less than 30 seconds old
            return now - photoTime < 30000;
          }
          return false;
        });
      });
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-full bg-neutral-100">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="h-[calc(100vh-4rem)]">
          {/* Photo Gallery - Full Width */}
          <section id="gallery" className="h-full overflow-hidden">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border border-neutral-200 h-full flex flex-col"
            >
              <div className="flex-1 overflow-y-auto p-6">
                <PhotoGallery
                  onFilesSelected={handleFilesSelected}
                  isUploading={isUploading}
                  maxFiles={env.upload.maxFiles}
                  optimisticPhotos={optimisticPhotos}
                />
              </div>
            </motion.div>
          </section>
        </div>

        {/* Floating Upload Status - Top Right */}
        <UploadProgressPanel uploads={uploadStates} onClear={clearUploads} />

        {/* Floating Chat Button - Bottom Right */}
        <ChatWindow />
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedFiles={selectedFiles}
        onRemoveFile={handleRemoveFile}
        onUpload={handleUpload}
        validationErrors={validationErrors}
        isUploading={isUploading}
        maxFiles={env.upload.maxFiles}
      />
    </div>
  );
}
