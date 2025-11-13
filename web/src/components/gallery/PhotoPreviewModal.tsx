import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PhotoStatusResponse } from '../../types/api.types';

interface PhotoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: PhotoStatusResponse[];
  initialIndex: number;
}

/**
 * PhotoPreviewModal Component
 * 
 * Full-screen photo preview modal with slideshow navigation.
 * Supports keyboard navigation (arrow keys, Escape).
 */
export default function PhotoPreviewModal({
  isOpen,
  onClose,
  photos,
  initialIndex,
}: PhotoPreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageError, setImageError] = useState(false);

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
    setImageError(false);
  }, [initialIndex, isOpen]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      return next >= photos.length ? 0 : next;
    });
    setImageError(false);
  }, [photos.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => {
      const prevIndex = prev - 1;
      return prevIndex < 0 ? photos.length - 1 : prevIndex;
    });
    setImageError(false);
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, photos.length, onClose, handleNext, handlePrevious]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

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
            className="fixed inset-0 bg-black/90 z-[100] backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-[101] p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Previous Button */}
            {photos.length > 1 && (
              <button
                onClick={handlePrevious}
                className="absolute left-4 z-[101] p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next Button */}
            {photos.length > 1 && (
              <button
                onClick={handleNext}
                className="absolute right-4 z-[101] p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Photo Container */}
            <div className="relative w-full h-full flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="relative max-w-full max-h-full"
                >
                  {!imageError && currentPhoto.photoUrl ? (
                    <img
                      src={currentPhoto.photoUrl}
                      alt={currentPhoto.fileName}
                      className="max-w-full max-h-[90vh] object-contain"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-[60vh] flex items-center justify-center bg-neutral-800 rounded-lg">
                      <div className="text-center text-white">
                        <svg
                          className="w-16 h-16 text-neutral-400 mx-auto mb-4"
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
                        <p className="text-neutral-400">Failed to load image</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Photo Info & Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[101] bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm">
              <div className="text-center">
                <p className="font-medium">{currentPhoto.fileName}</p>
                {photos.length > 1 && (
                  <p className="text-xs text-neutral-300 mt-1">
                    {currentIndex + 1} of {photos.length}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

