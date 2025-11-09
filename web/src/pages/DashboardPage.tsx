import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import UploadDropzone from '../components/upload/UploadDropzone';
import FileList from '../components/upload/FileList';
import UploadButton from '../components/upload/UploadButton';
import UploadValidation from '../components/upload/UploadValidation';
import { useFileUpload } from '../hooks/useFileUpload';
import { useFileValidation } from '../hooks/useFileValidation';
import { env } from '../config/env';
import PhotoGallery from '../components/gallery/PhotoGallery';

/**
 * Dashboard Page
 * 
 * Main dashboard page with photo upload and gallery.
 */
export default function DashboardPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const { validateFiles } = useFileValidation();
  const { uploadFiles, isUploading } = useFileUpload();

  const handleFilesSelected = useCallback((files: File[]) => {
    // Validate files
    const validation = validateFiles(files);
    
    if (validation.isValid) {
      setSelectedFiles((prev) => [...prev, ...files]);
      setValidationErrors([]);
    } else {
      setValidationErrors(validation.errors);
    }
  }, [validateFiles]);

  const handleRemoveFile = useCallback((file: File) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== file.name));
  }, []);

  const handleUpload = useCallback(() => {
    if (selectedFiles.length > 0) {
      uploadFiles(selectedFiles);
      setSelectedFiles([]);
    }
  }, [selectedFiles, uploadFiles]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            BlitzPhoto Dashboard
          </h1>
          <p className="text-gray-600">
            Lightning-fast photo uploads with Blitz Speed
          </p>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 space-y-6"
        >
          <h2 className="text-xl font-semibold text-gray-900">Upload Photos</h2>
          
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <UploadValidation errors={validationErrors} />
          )}

          {/* Dropzone */}
          <UploadDropzone
            onFilesSelected={handleFilesSelected}
            disabled={isUploading}
            maxFiles={env.upload.maxFiles}
          />

          {/* File List */}
          {selectedFiles.length > 0 && (
            <FileList
              files={selectedFiles}
              onRemove={handleRemoveFile}
            />
          )}

          {/* Upload Button */}
          {selectedFiles.length > 0 && (
            <div className="flex justify-end">
              <UploadButton
                onClick={handleUpload}
                disabled={isUploading || validationErrors.length > 0}
                loading={isUploading}
                fileCount={selectedFiles.length}
                maxFiles={env.upload.maxFiles}
              />
            </div>
          )}
        </motion.div>

        {/* Photo Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Your Photos
          </h2>
          <PhotoGallery />
        </motion.div>
      </div>
    </div>
  );
}
