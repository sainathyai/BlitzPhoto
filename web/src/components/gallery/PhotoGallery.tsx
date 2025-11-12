import { useState, useEffect, useMemo, useRef } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../lib/axios';
import { useAuth } from '../../hooks/useAuth';
import type { DeletePhotosResponse, PhotoStatusResponse } from '../../types/api.types';
import PhotoCard from './PhotoCard';
import { motion } from 'framer-motion';

/**
 * PhotoGallery Component
 * 
 * Displays grid of uploaded photos with pagination.
 */
export default function PhotoGallery() {
  const { user, isAuthenticated } = useAuth();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
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
    // Refetch photos periodically to get updates (only if authenticated)
    if (!isAuthenticated || !user) {
      return;
    }
    
    const interval = setInterval(() => {
      if (isAuthenticated && user) {
        refetch();
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [user, isAuthenticated, refetch]);

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
    if (!data?.pages) {
      return [];
    }

    return data.pages.flatMap((page) => page?.content ?? []) as PhotoStatusResponse[];
  }, [data]);

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

  // Safely check if data exists and has content array
  if (!allPhotos || allPhotos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No photos yet. Upload some photos to get started!</p>
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

  const isDeleting = deletePhotosMutation.status === 'pending';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Photo Library</h3>
          <p className="text-sm text-slate-500">
            {`Showing ${allPhotos.length} of ${totalItems} photos`}
            {selectedCount > 0 ? ` • ${selectedCount} selected` : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            disabled={allPhotos.length === 0}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-500"
          >
            {allSelected ? 'Clear selection' : 'Select all'}
          </button>
          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={selectedCount === 0 || isDeleting}
            className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300"
          >
            {isDeleting ? 'Deleting…' : `Delete selected (${selectedCount})`}
          </button>
        </div>
      </div>

      {/* Photo Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {allPhotos.map((photo, index) => (
          <motion.div
            key={photo.photoId}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <PhotoCard
              photo={photo}
              isSelected={selectedIds.has(photo.photoId)}
              selectionMode={selectedCount > 0}
              onToggleSelect={handleToggleSelect}
            />
          </motion.div>
        ))}
      </motion.div>

      <div ref={loadMoreRef} className="flex justify-center py-6">
        {isFetchingNextPage ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500" />
            Loading more photos...
          </div>
        ) : hasNextPage ? (
          <span className="text-sm text-slate-400">Scroll to load more</span>
        ) : (
          <span className="text-sm text-slate-400">You&apos;re all caught up</span>
        )}
      </div>
    </div>
  );
}

