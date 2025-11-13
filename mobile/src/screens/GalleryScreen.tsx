/**
 * Gallery Screen
 * 
 * Photo gallery screen with grid view and native features.
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { PhotoStatusResponse } from '../types/api.types';
import { theme } from '../constants/theme';
import { formatRelativeTime } from '../utils/format';
import { Ionicons } from '@expo/vector-icons';
import PhotoPreviewModal from '../components/gallery/PhotoPreviewModal';

export default function GalleryScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [size] = useState(20);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debug: Log user state
  console.log('GalleryScreen - User:', user ? { id: user.id, email: user.email } : 'null');
  console.log('GalleryScreen - Query enabled:', !!user);

  const { data, isLoading, error, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['photos', user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      console.log('Query function called with pageParam:', pageParam);
      if (!user) {
        console.log('No user, returning null');
        return null;
      }
      
      try {
        console.log('Fetching photos for user:', user.id);
        console.log('API URL:', apiClient.defaults.baseURL);
        console.log('Page param:', pageParam);
        
        const response = await apiClient.get('/uploads/photos', {
          params: {
            userId: user.id,
            page: pageParam,
            size,
            sortBy: 'createdAt',
            sortDirection: 'DESC',
          },
        });
        
        // Debug logging
        console.log('API Response status:', response.status);
        console.log('API Response data keys:', Object.keys(response.data || {}));
        console.log('Response content:', response.data?.content);
        console.log('Response content length:', response.data?.content?.length);
        console.log('Total elements:', response.data?.totalElements);
        console.log('Total pages:', response.data?.totalPages);
        
        if (response.data?.content && response.data.content.length > 0) {
          console.log('First photo photoUrl:', response.data.content[0].photoUrl);
          console.log('First photo status:', response.data.content[0].status);
        }
        
        return response.data;
      } catch (err: any) {
        console.error('Error fetching photos:', err);
        console.error('Error response:', err.response?.data);
        throw err;
      }
    },
    enabled: !!user,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.last) {
        return undefined;
      }
      return (lastPage.number ?? 0) + 1;
    },
    initialPageParam: 0,
  });

  // Extract photos from paginated response and deduplicate by photoId
  const photos: PhotoStatusResponse[] = useMemo(() => {
    const allPhotos = data?.pages?.flatMap((page) => {
      // Spring Data Page structure: { content: [...], number: 0, totalPages: 1, ... }
      const content = page?.content || [];
      console.log('Flattening page:', {
        hasContent: !!page?.content,
        contentLength: content.length,
        pageNumber: page?.number,
        totalPages: page?.totalPages,
        isLast: page?.last,
      });
      if (content.length > 0) {
        console.log('First photo sample:', {
          photoId: content[0].photoId,
          fileName: content[0].fileName,
          hasPhotoUrl: !!content[0].photoUrl,
          status: content[0].status,
        });
      }
      return content;
    }) || [];
    
    // Deduplicate by photoId (keep first occurrence)
    const photoMap = new Map<string, PhotoStatusResponse>();
    allPhotos.forEach((photo) => {
      if (!photoMap.has(photo.photoId)) {
        photoMap.set(photo.photoId, photo);
      }
    });
    
    // Convert to array and sort by createdAt descending
    const uniquePhotos = Array.from(photoMap.values()).sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Newest first
    });
    
    console.log('Total photos after flattening:', allPhotos.length);
    console.log('Total unique photos after deduplication:', uniquePhotos.length);
    
    return uniquePhotos;
  }, [data]);
  
  console.log('Data pages count:', data?.pages?.length || 0);
  console.log('Is loading:', isLoading);
  console.log('Has error:', !!error);
  console.log('Error details:', error ? (error as any).message : 'none');

  // Delete photos mutation
  const deletePhotosMutation = useMutation({
    mutationFn: async (photoIds: string[]) => {
      const response = await apiClient.delete('/uploads/photos', {
        data: { photoIds },
      });
      return response.data;
    },
    onSuccess: (response) => {
      const failed = response.results?.filter((result: any) => result.status !== 'DELETED') || [];
      if (failed.length > 0) {
        Alert.alert('Warning', 'Some photos could not be deleted');
      } else {
        Alert.alert('Success', 'Photos deleted successfully');
      }
      setSelectedIds(new Set());
      setSelectionMode(false);
      queryClient.invalidateQueries({ queryKey: ['photos', user?.id] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete photos');
    },
  });

  // Handle photo press
  const handlePhotoPress = (photo: PhotoStatusResponse, index: number) => {
    if (selectionMode) {
      // Toggle selection
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(photo.photoId)) {
          next.delete(photo.photoId);
        } else {
          next.add(photo.photoId);
        }
        return next;
      });
    } else {
      // Open preview
      setPreviewIndex(index);
      setPreviewVisible(true);
    }
  };

  // Handle long press to enter selection mode
  const handleLongPress = (photo: PhotoStatusResponse) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedIds(new Set([photo.photoId]));
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (selectedIds.size === 0) {
      Alert.alert('No Selection', 'Please select photos to delete');
      return;
    }

    Alert.alert(
      'Delete Photos',
      `Are you sure you want to delete ${selectedIds.size} photo(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deletePhotosMutation.mutate(Array.from(selectedIds));
          },
        },
      ]
    );
  };

  // Exit selection mode
  const handleExitSelection = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const renderPhoto = ({ item, index }: { item: PhotoStatusResponse; index: number }) => {
    const isSelected = selectedIds.has(item.photoId);
    
    return (
      <TouchableOpacity
        style={[styles.photoCard, isSelected && styles.photoCardSelected]}
        onPress={() => handlePhotoPress(item, index)}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.8}
      >
        {item.photoUrl ? (
          <Image
            source={{ uri: item.photoUrl }}
            style={styles.photo}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Ionicons name="image-outline" size={32} color={theme.colors.textSecondary} />
          </View>
        )}
        {selectionMode && (
          <View style={styles.selectionOverlay}>
            {isSelected && (
              <View style={styles.selectionCheck}>
                <Ionicons name="checkmark-circle" size={32} color={theme.colors.primary} />
              </View>
            )}
          </View>
        )}
        <View style={styles.photoInfo}>
          <Text style={styles.photoName} numberOfLines={1}>
            {item.fileName}
          </Text>
          <Text style={styles.photoMeta}>
            {formatRelativeTime(item.createdAt)}
          </Text>
        </View>
        {item.status === 'COMPLETED' && !selectionMode && (
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading && photos.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading photos...</Text>
      </View>
    );
  }

  if (error) {
    const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message || 'Failed to load photos';
    const statusCode = (error as any)?.response?.status;
    
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
        <Text style={styles.errorText}>Failed to load photos</Text>
        <Text style={styles.errorDetail}>{errorMessage}</Text>
        {statusCode && (
          <Text style={styles.errorDetail}>Status: {statusCode}</Text>
        )}
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (photos.length === 0 && !isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="images-outline" size={64} color={theme.colors.textSecondary} />
        <Text style={styles.emptyText}>No photos yet</Text>
        <Text style={styles.emptySubtext}>Upload some photos to get started!</Text>
        {data && (
          <Text style={styles.emptySubtext}>
            Debug: API returned {data.pages?.length || 0} page(s)
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {selectionMode && (
        <View style={styles.selectionBar}>
          <TouchableOpacity onPress={handleExitSelection} style={styles.selectionButton}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
            <Text style={styles.selectionButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.selectionCount}>
            {selectedIds.size} selected
          </Text>
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.selectionButton, styles.deleteButton]}
            disabled={deletePhotosMutation.isPending}
          >
            <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
            <Text style={[styles.selectionButtonText, styles.deleteButtonText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={(item) => item.photoId}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footerLoader}>
              <Text style={styles.loadingText}>Loading more...</Text>
            </View>
          ) : null
        }
      />
      <PhotoPreviewModal
        visible={previewVisible}
        photos={photos}
        initialIndex={previewIndex}
        onClose={() => setPreviewVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.error,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  errorDetail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  retryButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  emptyText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  list: {
    padding: theme.spacing.md,
  },
  row: {
    justifyContent: 'space-between',
  },
  photoCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
  },
  photoCardSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionCheck: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.full,
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  selectionButtonText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  selectionCount: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  deleteButton: {
    // Additional styles if needed
  },
  deleteButtonText: {
    color: theme.colors.error,
  },
  photo: {
    width: '100%',
    height: 200,
    backgroundColor: theme.colors.border,
  },
  photoInfo: {
    padding: theme.spacing.sm,
  },
  photoName: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  photoMeta: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.xs / 2,
  },
  photoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.border,
  },
  footerLoader: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
});
