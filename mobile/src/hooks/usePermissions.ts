/**
 * usePermissions Hook
 * 
 * Handles camera and photo library permissions.
 */

import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export interface PermissionStatus {
  camera: boolean;
  photoLibrary: boolean;
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionStatus>({
    camera: false,
    photoLibrary: false,
  });

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      const photoLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

      setPermissions({
        camera: cameraStatus.status === 'granted',
        photoLibrary: photoLibraryStatus.status === 'granted',
      });

      if (cameraStatus.status !== 'granted' || photoLibraryStatus.status !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'BlitzPhoto needs camera and photo library access to upload photos.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  return {
    permissions,
    requestPermissions,
  };
}

