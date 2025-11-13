import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../lib/axios';
import { useAuth } from '../../hooks/useAuth';
import type { DeletePhotosResponse, PhotoStatusResponse } from '../../types/api.types';
import PhotoCard from './PhotoCard';
import UploadTile from './UploadTile';
import PhotoPreviewModal from './PhotoPreviewModal';
import { motion } from 'framer-motion';

interface PhotoGalleryProps {
  onFilesSelected?: (files: File[]) => void;
  isUploading?: boolean;
  maxFiles?: number;
  optimisticPhotos?: PhotoStatusResponse[]; // Photos to show immediately before API loads
}

/**
 * PhotoGallery Component
 * 
 * Displays grid of uploaded photos with pagination.
 * Includes upload tile as the first item in the grid.
 */
export default function PhotoGallery({
  onFilesSelected,
  isUploading = false,
  maxFiles = 10000,
  optimisticPhotos = [],
}: PhotoGalleryProps = {}) {
  const { user, isAuthenticated } = useAuth();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ x: number; y: number } | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const refetchRef = useRef<() => void>(() => {});
  const pageSize = 20;

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['photos', user?.id],
    enabled: !!user && isAuthenticated,
    initialPageParam: 0,
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: false, // Disable refetch on mount if data exists
    refetchOnReconnect: false, // Disable refetch on reconnect
    staleTime: 30000, // Consider data fresh for 30 seconds
    queryFn: async ({ pageParam }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await apiClient.get('/uploads/photos', {
        params: {
          userId: user.id,
          page: pageParam,
          size: pageSize,
          sortBy: 'createdAt',
          sortDirection: 'DESC',
        },
      });

      return response.data;
    },
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors (401/403)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.last) {
        return undefined;
      }
      return (lastPage.number ?? 0) + 1;
    },
  });

  const deletePhotosMutation = useMutation({
    mutationFn: async (photoIds: string[]) => {
      const response = await apiClient.delete<DeletePhotosResponse>('/uploads/photos', {
        data: { photoIds },
      });
      return response.data;
    },
    onSuccess: (response) => {
      const failed = response.results.filter((result) => result.status !== 'DELETED');
      if (failed.length > 0) {
        console.warn('Some photos could not be deleted:', failed);
      }
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['photos', user?.id] });
    },
    onError: (mutationError) => {
      console.error('Failed to delete photos:', mutationError);
    },
  });

  useEffect(() => {
    if (!data?.pages) {
      setSelectedIds(new Set());
      return;
    }

    const currentIds = new Set(
      data.pages
        .flatMap((page) => page?.content ?? [])
        .map((photo: PhotoStatusResponse) => photo.photoId)
    );

    setSelectedIds((prev) => {
      if (prev.size === 0) {
        return prev;
      }

      const filtered = new Set(Array.from(prev).filter((id) => currentIds.has(id)));
      return filtered.size === prev.size ? prev : filtered;
    });
  }, [data]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const allPhotos = useMemo(() => {
    const apiPhotos = data?.pages 
      ? (data.pages.flatMap((page) => page?.content ?? []) as PhotoStatusResponse[])
      : [];
    
    // Merge optimistic photos with API photos, avoiding duplicates by photoId
    // Use Map to ensure uniqueness - if same photoId appears multiple times, keep the first one
    const photoMap = new Map<string, PhotoStatusResponse>();
    
    // First, add all API photos (they take precedence)
    // If duplicates exist in API response, Map will automatically deduplicate
    apiPhotos.forEach(photo => {
      if (photo.photoId && !photoMap.has(photo.photoId)) {
        photoMap.set(photo.photoId, photo);
      }
    });
    
    // Then add optimistic photos that don't exist in API yet
    optimisticPhotos.forEach(opt => {
      if (opt.photoId && !photoMap.has(opt.photoId)) {
        photoMap.set(opt.photoId, opt);
      }
    });
    
    // Convert map to array, sort by createdAt descending
    const uniquePhotos = Array.from(photoMap.values()).sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Newest first
    });
    
    // Debug: Log if duplicates were found
    if (apiPhotos.length > uniquePhotos.length) {
      console.warn(`Deduplication: Found ${apiPhotos.length} photos, ${uniquePhotos.length} unique after deduplication`);
    }
    
    return uniquePhotos;
  }, [data, optimisticPhotos]);

  // Only poll when there are photos that are still processing
  const hasProcessingPhotos = useMemo(() => {
    return allPhotos.some(photo => 
      photo.status === 'PROCESSING' || photo.status === 'PENDING'
    );
  }, [allPhotos]);

  // Store refetch in ref to avoid stale closures
  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  useEffect(() => {
    // Only refetch periodically if there are photos still processing
    // Once all photos are completed, stop polling
    if (!isAuthenticated || !user || !hasProcessingPhotos) {
      return;
    }
    
    const interval = setInterval(() => {
      if (isAuthenticated && user && refetchRef.current) {
        refetchRef.current();
      }
    }, 10000); // Poll every 10 seconds only when processing

    return () => clearInterval(interval);
  }, [user, isAuthenticated, hasProcessingPhotos]); // Removed refetch from deps to prevent re-renders

  // Drag selection handlers - MUST be before any early returns
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Only start drag if clicking on empty space in the grid
    const target = e.target as HTMLElement;
    
    // Don't start drag if clicking on interactive elements
    if (
      target.closest('[data-photo-card]') || 
      target.closest('button') || 
      target.closest('input') ||
      target.closest('a') ||
      target.closest('[role="button"]')
    ) {
      return;
    }

    // Only start drag on left mouse button
    if ('button' in e && e.button !== 0) {
      return;
    }

    // Prevent text selection and default behavior
    e.preventDefault();
    e.stopPropagation();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (!gridRef.current) return;

    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
    setDragEnd({ x: clientX, y: clientY });
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.cursor = 'crosshair';
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
    
    // Re-enable text selection and cursor
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    document.body.style.cursor = '';
  }, []);

  // Global mouse/touch event handlers for drag selection
  useEffect(() => {
    if (!isDragging || !dragStart || !gridRef.current) return;

    const handleDragMove = (e: MouseEvent | TouchEvent) => {
      // Prevent default to avoid text selection
      e.preventDefault();
      
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      setDragEnd({ x: clientX, y: clientY });

      // Find photos within selection rectangle
      if (!gridRef.current) return;
      
      const rect = gridRef.current.getBoundingClientRect();
      const selectionRect = {
        left: Math.min(dragStart.x, clientX) - rect.left,
        top: Math.min(dragStart.y, clientY) - rect.top,
        right: Math.max(dragStart.x, clientX) - rect.left,
        bottom: Math.max(dragStart.y, clientY) - rect.top,
      };

      const photoElements = gridRef.current.querySelectorAll('[data-photo-card]');
      const photosToSelect = new Set<string>();

      photoElements.forEach((element) => {
        const cardRect = element.getBoundingClientRect();
        const cardLeft = cardRect.left - rect.left;
        const cardTop = cardRect.top - rect.top;
        const cardRight = cardLeft + cardRect.width;
        const cardBottom = cardTop + cardRect.height;

        // Check if card intersects with selection rectangle
        if (
          cardLeft < selectionRect.right &&
          cardRight > selectionRect.left &&
          cardTop < selectionRect.bottom &&
          cardBottom > selectionRect.top
        ) {
          const photoId = element.getAttribute('data-photo-id');
          if (photoId) {
            photosToSelect.add(photoId);
          }
        }
      });

      // Update selection - add all photos in selection rectangle
      if (photosToSelect.size > 0) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          photosToSelect.forEach((id) => next.add(id));
          return next;
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e);
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleDragMove(e);
    };

    const handleTouchEnd = () => {
      handleDragEnd();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      // Re-enable text selection on cleanup
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, [isDragging, dragStart, handleDragEnd]);

  const totalItems = data?.pages?.[0]?.totalElements ?? allPhotos.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    const errorStatus = (error as any)?.response?.status;
    const isAuthError = errorStatus === 401 || errorStatus === 403;
    const message = isAuthError 
      ? 'Your session has expired. Please log in again.'
      : error instanceof Error ? error.message : 'Failed to load photos';
    
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{message}</p>
        {!isAuthError && (
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  // Empty state - show preview grid
  if (!allPhotos || allPhotos.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4 border-b border-neutral-200">
          <div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-1">Photo Library</h3>
            <p className="text-sm text-neutral-500">No photos yet</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="inline-block p-6 bg-neutral-100 rounded-2xl mb-4">
            <svg className="w-16 h-16 text-neutral-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-neutral-700 mb-2">No photos yet</p>
          <p className="text-sm text-neutral-500 mb-6">Upload some photos to get started!</p>
          {/* Preview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 max-w-4xl mx-auto mt-8">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-neutral-100 rounded-xl border-2 border-dashed border-neutral-300 flex items-center justify-center opacity-50"
              >
                <div className="w-8 h-8 text-neutral-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const selectedCount = selectedIds.size;
  const allSelected = selectedCount > 0 && selectedCount === allPhotos.length;

  const handleToggleSelect = (photoId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds((prev) => {
      if (prev.size === allPhotos.length) {
        return new Set();
      }
      return new Set(allPhotos.map((photo) => photo.photoId));
    });
  };

  const handleDeleteSelected = () => {
    if (selectedCount === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedCount} selected photo${selectedCount === 1 ? '' : 's'}? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    deletePhotosMutation.mutate(Array.from(selectedIds));
  };

  const handleViewPhoto = (photoId: string) => {
    const index = allPhotos.findIndex((p) => p.photoId === photoId);
    if (index !== -1) {
      setPreviewIndex(index);
      setPreviewModalOpen(true);
    }
  };

  const isDeleting = deletePhotosMutation.status === 'pending';

  return (
    <div className="space-y-6">
      {/* Header with Contextual Actions */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pb-3 border-b border-neutral-200">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 mb-0.5">Photo Library</h3>
          <p className="text-xs text-neutral-500">
            {`Showing ${allPhotos.length} of ${totalItems} photos`}
            {selectedCount > 0 ? ` • ${selectedCount} selected` : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            disabled={allPhotos.length === 0}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-lg transition-colors hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {allSelected ? 'Clear selection' : 'Select all'}
          </button>
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={selectedCount === 0 || isDeleting}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-danger rounded-lg shadow-sm transition-all hover:bg-danger-light hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? 'Deleting…' : `Delete (${selectedCount})`}
          </button>
        </div>
      </div>

      {/* Photo Grid */}
      <div 
        className="relative" 
        style={{ userSelect: isDragging ? 'none' : 'auto', minHeight: '200px' }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <motion.div
          ref={gridRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4"
          style={{ userSelect: 'none', WebkitUserSelect: 'none', pointerEvents: 'auto' }}
        >
        {/* Upload Tile - First Item */}
        {onFilesSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0 }}
          >
            <UploadTile
              onFilesSelected={onFilesSelected}
              disabled={isUploading}
              maxFiles={maxFiles}
            />
          </motion.div>
        )}
        
        {/* Photo Cards */}
        {allPhotos.map((photo, index) => (
          <motion.div
            key={photo.photoId}
            data-photo-card
            data-photo-id={photo.photoId}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (index + (onFilesSelected ? 1 : 0)) * 0.03 }}
          >
            <PhotoCard
              photo={photo}
              isSelected={selectedIds.has(photo.photoId)}
              selectionMode={selectedCount > 0}
              onToggleSelect={handleToggleSelect}
              onView={handleViewPhoto}
              onEnterSelectionMode={() => {
                // Enter selection mode by selecting this photo
                handleToggleSelect(photo.photoId);
              }}
            />
          </motion.div>
        ))}
        </motion.div>

        {/* Drag Selection Rectangle */}
        {isDragging && dragStart && dragEnd && gridRef.current && (
          <div
            className="absolute border-2 border-primary bg-primary/10 pointer-events-none z-50"
            style={{
              left: `${Math.min(dragStart.x, dragEnd.x) - gridRef.current.getBoundingClientRect().left}px`,
              top: `${Math.min(dragStart.y, dragEnd.y) - gridRef.current.getBoundingClientRect().top}px`,
              width: `${Math.abs(dragEnd.x - dragStart.x)}px`,
              height: `${Math.abs(dragEnd.y - dragStart.y)}px`,
              borderColor: 'rgb(99 102 241)',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
            }}
          />
        )}
      </div>

      {/* Empty State Preview Grid */}
      {allPhotos.length === 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 py-12">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-neutral-100 rounded-xl border-2 border-dashed border-neutral-300 flex items-center justify-center"
            >
              <div className="w-8 h-8 text-neutral-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Indicator */}
      <div ref={loadMoreRef} className="flex justify-center py-8">
        {isFetchingNextPage ? (
          <div className="flex items-center gap-3 text-sm text-neutral-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-primary" />
            <span>Loading more photos...</span>
          </div>
        ) : hasNextPage ? (
          <span className="text-sm text-neutral-400">Scroll to load more</span>
        ) : allPhotos.length > 0 ? (
          <span className="text-sm text-neutral-400">You&apos;re all caught up</span>
        ) : null}
      </div>

      {/* Photo Preview Modal */}
      <PhotoPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        photos={allPhotos}
        initialIndex={previewIndex}
      />
    </div>
  );
}

