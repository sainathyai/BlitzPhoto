/**
 * Gallery Screen
 * 
 * Photo gallery screen with grid view and native features.
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { PhotoStatusResponse } from '../types/api.types';
import { theme } from '../constants/theme';
import { formatFileSize, formatRelativeTime } from '../utils/format';
import { Ionicons } from '@expo/vector-icons';

export default function GalleryScreen() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [size] = useState(20);

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
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

  const photos: PhotoStatusResponse[] = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const renderPhoto = ({ item }: { item: PhotoStatusResponse }) => {
    return (
      <TouchableOpacity style={styles.photoCard}>
        <Image
          source={{ uri: `https://${item.s3Key}` }}
          style={styles.photo}
          defaultSource={require('../../assets/icon.png')}
        />
        <View style={styles.photoInfo}>
          <Text style={styles.photoName} numberOfLines={1}>
            {item.fileName}
          </Text>
          <Text style={styles.photoMeta}>
            {formatFileSize(item.fileSize)} • {formatRelativeTime(item.createdAt)}
          </Text>
        </View>
        {item.status === 'COMPLETED' && (
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
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load photos</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="images-outline" size={64} color={theme.colors.textSecondary} />
        <Text style={styles.emptyText}>No photos yet</Text>
        <Text style={styles.emptySubtext}>Upload some photos to get started!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
          if (page < totalPages - 1) {
            setPage((p) => p + 1);
          }
        }}
        onEndReachedThreshold={0.5}
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
    marginBottom: theme.spacing.md,
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
});
