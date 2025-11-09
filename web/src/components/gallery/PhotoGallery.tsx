import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../lib/axios';
import { useAuth } from '../../hooks/useAuth';
import type { PhotoStatusResponse } from '../../types/api.types';
import PhotoCard from './PhotoCard';
import { motion } from 'framer-motion';

/**
 * PhotoGallery Component
 * 
 * Displays grid of uploaded photos with pagination.
 */
export default function PhotoGallery() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [size] = useState(20);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['photos', user?.id, page, size],
    queryFn: async () => {
      if (!user) return null;
      
      const response = await apiClient.get('/uploads/photos', {
        params: {
          userId: user.id,
          page,
          size,
          sortBy: 'createdAt',
          sortDirection: 'DESC',
        },
      });
      
      return response.data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    // Refetch photos periodically to get updates
    const interval = setInterval(() => {
      if (user) {
        refetch();
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [user, refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load photos</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || data.content.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No photos yet. Upload some photos to get started!</p>
      </div>
    );
  }

  const photos: PhotoStatusResponse[] = data.content;
  const totalPages = data.totalPages || 0;

  return (
    <div className="space-y-6">
      {/* Photo Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {photos.map((photo, index) => (
          <motion.div
            key={photo.photoId}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <PhotoCard photo={photo} />
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

