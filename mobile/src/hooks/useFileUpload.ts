/**
 * useFileUpload Hook
 * 
 * Handles file upload logic including presigned URL generation and S3 upload.
 */

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api';
import { useUploadStore } from '../store/uploadStore';
import { useAuth } from './useAuth';
import type { 
  InitiateUploadRequest, 
  InitiateUploadResponse, 
  PhotoUploadRequest,
  CompleteUploadRequest,
  CompleteUploadResponse
} from '../types/api.types';
import { env } from '../constants/env';
import { Alert } from 'react-native';

export interface FileUploadState {
  uri: string;
  photoId?: string;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  progress: number;
  error?: string;
  presignedUrl?: string;
}

export function useFileUpload() {
  const { user } = useAuth();
  const { setCurrentUploadJob, setIsUploading } = useUploadStore();
  const queryClient = useQueryClient();
  const [uploadStates, setUploadStates] = useState<Map<string, FileUploadState>>(new Map());

  // Mutation for initiating upload
  const initiateUploadMutation = useMutation({
    mutationFn: async (photos: Array<{ uri: string; name: string; type: string; size: number }>): Promise<InitiateUploadResponse> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const photoRequests: PhotoUploadRequest[] = photos.map((photo) => ({
        fileName: photo.name,
        mimeType: photo.type,
        fileSize: photo.size,
      }));

      const request: InitiateUploadRequest = {
        userId: user.id,
        photos: photoRequests,
      };

      const response = await apiClient.post<InitiateUploadResponse>('/uploads', request);
      return response.data;
    },
    onSuccess: async (data, variables) => {
      setCurrentUploadJob(data);
      setIsUploading(true);

      // Initialize upload states
      const newStates = new Map<string, FileUploadState>();
      data.photos.forEach((photo, index) => {
        const photoData = variables[index];
        newStates.set(photoData.uri, {
          uri: photoData.uri,
          photoId: photo.photoId,
          status: 'pending',
          progress: 0,
          presignedUrl: photo.presignedUrl.url,
        });
      });
      setUploadStates(newStates);

      // Start uploading files to S3
      await uploadFilesToS3(data, variables);
    },
    onError: (error: any) => {
      Alert.alert('Upload Failed', error.response?.data?.message || 'Failed to initiate upload');
      setIsUploading(false);
    },
  });

  // Upload files to S3 using presigned URLs
  const uploadFilesToS3 = async (
    uploadResponse: InitiateUploadResponse,
    photos: Array<{ uri: string; name: string; type: string; size: number }>
  ) => {
    const uploadResults = await Promise.allSettled(
      uploadResponse.photos.map(async (photo, index) => {
        const photoData = photos[index];
        const state = uploadStates.get(photoData.uri);

        try {
          // Update state to uploading
          setUploadStates((prev) => {
            const newMap = new Map(prev);
            const current = newMap.get(photoData.uri);
            if (current) {
              newMap.set(photoData.uri, { ...current, status: 'uploading', progress: 0 });
            }
            return newMap;
          });

          // Convert local URI to blob for upload
          const response = await fetch(photoData.uri);
          const blob = await response.blob();

          // Upload to S3
        const uploadResponse = await fetch(photo.presignedUrl.url, {
          method: 'PUT',
          body: blob,
          headers: {
            'Content-Type': photo.presignedUrl.contentType,
            'x-amz-server-side-encryption': 'AES256',
          },
        });

          if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.statusText}`);
          }

          // Update state to completed
          setUploadStates((prev) => {
            const newMap = new Map(prev);
            const current = newMap.get(photoData.uri);
            if (current) {
              newMap.set(photoData.uri, { ...current, status: 'completed', progress: 100 });
            }
            return newMap;
          });
          
          return { success: true, photoId: photo.photoId };
        } catch (error) {
          // Update state to failed
          setUploadStates((prev) => {
            const newMap = new Map(prev);
            const current = newMap.get(photoData.uri);
            if (current) {
              newMap.set(photoData.uri, {
                ...current,
                status: 'failed',
                error: error instanceof Error ? error.message : 'Upload failed',
              });
            }
            return newMap;
          });
          
          return { success: false, photoId: photo.photoId, error };
        }
      })
    );

    // Check if all uploads succeeded
    const allCompleted = uploadResults.every(
      (result) => result.status === 'fulfilled' && result.value.success
    );

    // Call complete upload endpoint if all uploads succeeded
    if (allCompleted && uploadResponse.uploadJobId && user) {
      try {
        const completeRequest: CompleteUploadRequest = {
          uploadJobId: uploadResponse.uploadJobId,
          userId: user.id,
        };

        await apiClient.post<CompleteUploadResponse>('/uploads/complete', completeRequest);
        console.log('Upload job completed successfully');

        // Invalidate photos query to refresh the gallery
        queryClient.invalidateQueries({ queryKey: ['photos'] });
      } catch (error) {
        console.error('Failed to complete upload job:', error);
        // Don't fail the entire upload - files are already in S3
      }
    }

    setIsUploading(false);
  };

  const uploadFiles = useCallback((photos: Array<{ uri: string; name: string; type: string; size: number }>) => {
    initiateUploadMutation.mutate(photos);
  }, [initiateUploadMutation]);

  return {
    uploadFiles,
    uploadStates: Array.from(uploadStates.values()),
    isUploading: initiateUploadMutation.isPending,
    error: initiateUploadMutation.error,
  };
}

