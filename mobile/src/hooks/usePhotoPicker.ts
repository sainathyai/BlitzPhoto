/**
 * usePhotoPicker Hook
 * 
 * Handles photo selection from camera and gallery.
 */

import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { usePermissions } from './usePermissions';
import { env } from '../constants/env';

export interface SelectedPhoto {
  uri: string;
  name: string;
  type: string;
  size: number;
  width?: number;
  height?: number;
}

export function usePhotoPicker() {
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const { permissions, requestPermissions } = usePermissions();

  const pickFromGallery = async () => {
    if (!permissions.photoLibrary) {
      await requestPermissions();
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
        allowsEditing: false,
        selectionLimit: env.upload.maxFiles,
      });

      if (!result.canceled && result.assets) {
        const newPhotos: SelectedPhoto[] = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
          size: asset.fileSize || 0,
          width: asset.width,
          height: asset.height,
        }));

        setSelectedPhotos((prev) => {
          const combined = [...prev, ...newPhotos];
          if (combined.length > env.upload.maxFiles) {
            Alert.alert(
              'Limit Reached',
              `You can only select up to ${env.upload.maxFiles} photos at once.`
            );
            return combined.slice(0, env.upload.maxFiles);
          }
          return combined;
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick photos from gallery');
    }
  };

  const takePhoto = async () => {
    if (!permissions.camera) {
      await requestPermissions();
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newPhoto: SelectedPhoto = {
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
          size: asset.fileSize || 0,
          width: asset.width,
          height: asset.height,
        };

        setSelectedPhotos((prev) => {
          const combined = [...prev, newPhoto];
          if (combined.length > env.upload.maxFiles) {
            Alert.alert(
              'Limit Reached',
              `You can only select up to ${env.upload.maxFiles} photos at once.`
            );
            return combined.slice(0, env.upload.maxFiles);
          }
          return combined;
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const clearPhotos = () => {
    setSelectedPhotos([]);
  };

  return {
    selectedPhotos,
    pickFromGallery,
    takePhoto,
    removePhoto,
    clearPhotos,
    canSelectMore: selectedPhotos.length < env.upload.maxFiles,
  };
}

