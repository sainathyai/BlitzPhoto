import { useState, type MouseEvent, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { PhotoStatusResponse } from '../../types/api.types';

interface PhotoCardProps {
  photo: PhotoStatusResponse;
  isSelected?: boolean;
  selectionMode?: boolean;
  onToggleSelect?: (photoId: string) => void;
  onView?: (photoId: string) => void;
  onEnterSelectionMode?: () => void;
}

/**
 * PhotoCard Component
 * 
 * Displays individual photo card with thumbnail, metadata, and actions.
 */
export default function PhotoCard({ photo, isSelected = false, selectionMode = false, onToggleSelect, onView, onEnterSelectionMode }: PhotoCardProps) {
  const [imageError, setImageError] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const handleToggle = (event?: MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    onToggleSelect?.(photo.photoId);
  };

  const handleMouseDown = (_e: React.MouseEvent | React.TouchEvent) => {
    if (selectionMode) return; // Already in selection mode
    
    // Reset state
    longPressTriggeredRef.current = false;
    
    // Start long press timer - store timer ID
    const timerId = setTimeout(() => {
      // Only trigger if this timer is still active
      if (longPressTimerRef.current === timerId) {
        longPressTriggeredRef.current = true;
        // onEnterSelectionMode already calls handleToggleSelect, so don't call it again
        onEnterSelectionMode?.();
      }
    }, 500); // 500ms long press
    
    longPressTimerRef.current = timerId;
  };

  const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    const timerWasActive = longPressTimerRef.current !== null;
    const longPressCompleted = longPressTriggeredRef.current;
    
    // Clear the timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // If long press was completed, prevent click
    if (longPressCompleted) {
      e.preventDefault();
      e.stopPropagation();
      // Don't reset immediately - let click handler check it
    } else if (!timerWasActive) {
      // Timer was already cleared (long press completed), prevent click
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleMouseLeave = (_e: React.MouseEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const getStatusBadge = () => {
    switch (photo.status) {
      case 'COMPLETED':
        return (
          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-500 text-white rounded">
            Completed
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-500 text-white rounded">
            Processing
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-500 text-white rounded">
            Failed
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-500 text-white rounded">
            {photo.status}
          </span>
        );
    }
  };

  const formatDateShort = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  };

  const interactiveSelection = selectionMode || isSelected;
  const cardClasses = [
    'relative',
    'overflow-hidden',
    'rounded-xl',
    'bg-white',
    'border',
    'transition-all',
    'duration-300',
    'hover:shadow-xl',
    'hover:border-primary-300',
    isSelected ? 'border-2 border-primary shadow-lg shadow-primary-100 ring-2 ring-primary-200' : 'border-neutral-200 shadow-sm',
    interactiveSelection ? 'cursor-pointer' : 'cursor-default',
  ].join(' ');

  return (
    <motion.div
      className={cardClasses}
      onMouseLeave={handleMouseLeave}
      onPointerDown={(e) => {
        // Stop propagation to prevent drag selection when clicking on photo
        e.stopPropagation();
        // Only handle left mouse button or touch
        if (e.button === 0 || e.pointerType === 'touch') {
          handleMouseDown(e);
        }
      }}
      onPointerUp={(e) => {
        if (e.button === 0 || e.pointerType === 'touch') {
          handleMouseUp(e);
        }
      }}
      // Fallback for browsers that don't support pointer events
      onMouseDown={(e) => {
        // Stop propagation to prevent drag selection when clicking on photo
        e.stopPropagation();
        if (e.button === 0) {
          handleMouseDown(e);
        }
      }}
      onMouseUp={(e) => {
        if (e.button === 0) {
          handleMouseUp(e);
        }
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        handleMouseDown(e);
      }}
      onTouchEnd={(e) => handleMouseUp(e)}
      onContextMenu={(e) => {
        // Prevent context menu on long press
        if (!selectionMode) {
          e.preventDefault();
        }
      }}
      whileHover={selectionMode ? {} : { y: -2 }}
      onClick={(e) => {
        // Prevent click if we just triggered long press
        if (longPressTriggeredRef.current) {
          e.preventDefault();
          e.stopPropagation();
          longPressTriggeredRef.current = false;
          return;
        }
        // Don't handle click if it was part of a drag selection
        if ((e.target as HTMLElement).closest('[data-photo-card]') && e.detail === 0) {
          return; // This was a drag, not a click
        }
        if (selectionMode) {
          onToggleSelect?.(photo.photoId);
        } else if (onView && !longPressTimerRef.current) {
          // Only view if we're not in the middle of a long press
          onView(photo.photoId);
        }
      }}
    >
      {/* Selection Checkbox - Only show in selection mode */}
      {selectionMode && (
        <button
          type="button"
          onClick={handleToggle}
          className={`absolute top-2 left-2 z-20 flex h-5 w-5 items-center justify-center rounded-full border-2 text-[10px] font-bold transition ${
            isSelected
              ? 'border-indigo-500 bg-indigo-500 text-white shadow-sm shadow-indigo-200'
              : 'border-slate-300 bg-white text-transparent hover:text-slate-400'
          }`}
          aria-pressed={isSelected}
        >
          ✓
        </button>
      )}

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

        {/* Overlay Actions - Only show View button on click, not hover */}
        {/* Removed hover overlay to reduce distraction */}

        {/* Status Badge */}
        {photo.status !== 'COMPLETED' && (
          <div className="absolute top-2 right-2">
            {getStatusBadge()}
          </div>
        )}

        {/* Upload Date Overlay - Bottom Right */}
        <div className="absolute bottom-1.5 right-1.5 text-white text-[9px] font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {formatDateShort(photo.createdAt)}
        </div>
      </div>

      {/* Error Message */}
      {photo.errorMessage && (
        <div className="p-2">
          <p className="text-[10px] text-red-600 truncate" title={photo.errorMessage}>
            {photo.errorMessage}
          </p>
        </div>
      )}
    </motion.div>
  );
}

