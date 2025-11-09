/**
 * Home Screen
 * 
 * Main screen with upload functionality including camera and gallery integration.
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { usePhotoPicker } from '../hooks/usePhotoPicker';
import { useFileUpload } from '../hooks/useFileUpload';
import CameraButton from '../components/upload/CameraButton';
import GalleryButton from '../components/upload/GalleryButton';
import PhotoList from '../components/upload/PhotoList';
import { theme } from '../constants/theme';
import { env } from '../constants/env';

export default function HomeScreen() {
  const {
    selectedPhotos,
    pickFromGallery,
    takePhoto,
    removePhoto,
    clearPhotos,
    canSelectMore,
  } = usePhotoPicker();

  const { uploadFiles, isUploading } = useFileUpload();

  const handleUpload = () => {
    if (selectedPhotos.length === 0) {
      Alert.alert('No Photos', 'Please select photos to upload');
      return;
    }

    // Convert SelectedPhoto to format expected by useFileUpload
    const photos = selectedPhotos.map((photo) => ({
      uri: photo.uri,
      name: photo.name,
      type: photo.type,
      size: photo.size,
    }));

    uploadFiles(photos);
    clearPhotos();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Upload Photos</Text>
        <Text style={styles.subtitle}>
          Select up to {env.upload.maxFiles} photos to upload at Blitz Speed
        </Text>
      </View>

      <View style={styles.actions}>
        <CameraButton
          onPress={takePhoto}
          disabled={!canSelectMore || isUploading}
        />
        <View style={styles.spacer} />
        <GalleryButton
          onPress={pickFromGallery}
          disabled={!canSelectMore || isUploading}
        />
      </View>

      {selectedPhotos.length > 0 && (
        <PhotoList photos={selectedPhotos} onRemove={removePhoto} />
      )}

      {selectedPhotos.length > 0 && (
        <View style={styles.uploadSection}>
          <TouchableOpacity
            style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
            onPress={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color={theme.colors.background} />
            ) : (
              <Text style={styles.uploadButtonText}>
                Upload {selectedPhotos.length} Photo{selectedPhotos.length > 1 ? 's' : ''}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  spacer: {
    width: theme.spacing.md,
  },
  uploadSection: {
    marginTop: theme.spacing.lg,
  },
  uploadButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
});
