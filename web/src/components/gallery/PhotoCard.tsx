import { useState, type MouseEvent } from 'react';
import { motion } from 'framer-motion';
import type { PhotoStatusResponse } from '../../types/api.types';
import { formatFileSize, formatDate } from '../../lib/utils';

interface PhotoCardProps {
  photo: PhotoStatusResponse;
  isSelected?: boolean;
  selectionMode?: boolean;
  onToggleSelect?: (photoId: string) => void;
}

/**
 * PhotoCard Component
 * 
 * Displays individual photo card with thumbnail, metadata, and actions.
 */
export default function PhotoCard({ photo, isSelected = false, selectionMode = false, onToggleSelect }: PhotoCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleToggle = (event?: MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    onToggleSelect?.(photo.photoId);
  };

  const getStatusBadge = () => {
    switch (photo.status) {
      case 'COMPLETED':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            Completed
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            Processing
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
            Failed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            {photo.status}
          </span>
        );
    }
  };

  const interactiveSelection = selectionMode || isSelected;
  const cardClasses = [
    'relative',
    'overflow-hidden',
    'rounded-xl',
    'bg-white',
    'border',
    'transition-all',
    'duration-200',
    'hover:shadow-xl',
    isSelected ? 'border-2 border-indigo-500 shadow-lg shadow-indigo-100' : 'border-slate-200 shadow-sm',
    interactiveSelection ? 'cursor-pointer' : 'cursor-default',
  ].join(' ');

  return (
    <motion.div
      className={cardClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      onClick={() => {
        if (interactiveSelection) {
          onToggleSelect?.(photo.photoId);
        }
      }}
    >
      {/* Selection Checkbox */}
      <button
        type="button"
        onClick={handleToggle}
        className={`absolute top-3 left-3 z-20 flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
          isSelected
            ? 'border-indigo-500 bg-indigo-500 text-white shadow-sm shadow-indigo-200'
            : 'border-slate-300 bg-white text-transparent hover:text-slate-400'
        }`}
        aria-pressed={isSelected}
      >
        ✓
      </button>

      {/* Thumbnail */}
      <div className="relative aspect-square bg-gray-100">
        {!imageError && photo.photoUrl ? (
          <img
            src={photo.photoUrl}
            alt={photo.fileName}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
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

        {/* Overlay Actions */}
        {isHovered && !selectionMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center space-x-2"
          >
            <button
              className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => {
                // View functionality
                if (photo.photoUrl) {
                  window.open(photo.photoUrl, '_blank');
                }
              }}
            >
              View
            </button>
          </motion.div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          {getStatusBadge()}
        </div>
      </div>

      {/* Metadata */}
      <div className="p-4 space-y-2">
        <p className="text-sm font-medium text-gray-900 truncate">
          {photo.fileName}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatFileSize(photo.fileSize)}</span>
          <span>{formatDate(photo.createdAt)}</span>
        </div>
        {photo.errorMessage && (
          <p className="text-xs text-red-600 truncate" title={photo.errorMessage}>
            {photo.errorMessage}
          </p>
        )}
      </div>
    </motion.div>
  );
}

