import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/axios';
import { useUploadStore } from '../store/uploadStore';
import { useAuth } from './useAuth';
import type { InitiateUploadRequest, InitiateUploadResponse, PhotoUploadRequest } from '../types/api.types';
import { env } from '../config/env';

export interface FileUploadState {
  file: File;
  photoId?: string;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  progress: number;
  error?: string;
  presignedUrl?: string;
}

/**
 * useFileUpload Hook
 * 
 * Handles file upload logic including presigned URL generation and S3 upload.
 */
export function useFileUpload() {
  const { user } = useAuth();
  const { setCurrentUploadJob, setIsUploading } = useUploadStore();
  const queryClient = useQueryClient();
  const [uploadStates, setUploadStates] = useState<Map<string, FileUploadState>>(new Map());

  // Mutation for initiating upload
  const initiateUploadMutation = useMutation({
    mutationFn: async (files: File[]): Promise<InitiateUploadResponse> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const photoRequests: PhotoUploadRequest[] = files.map((file) => ({
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
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
        const file = variables[index];
        newStates.set(file.name, {
          file,
          photoId: photo.photoId,
          status: 'pending',
          progress: 0,
          presignedUrl: photo.presignedUrl.url,
        });
      });
      setUploadStates(newStates);

      // Start uploading files
      await uploadFilesToS3(data, variables);
    },
    onError: (error) => {
      console.error('Failed to initiate upload:', error);
      setIsUploading(false);
    },
  });

  // Upload files to S3 using presigned URLs
  const uploadFilesToS3 = async (uploadResponse: InitiateUploadResponse, files: File[]) => {
    const uploadPromises = uploadResponse.photos.map(async (photo, index) => {
      const file = files[index];
      const state = uploadStates.get(file.name);
      if (!state) {
        // Create state if it doesn't exist
        const newState: FileUploadState = {
          file,
          photoId: photo.photoId,
          status: 'pending',
          progress: 0,
          presignedUrl: photo.presignedUrl.url,
        };
        setUploadStates((prev) => new Map(prev).set(file.name, newState));
      }

      try {
        // Update state to uploading
        setUploadStates((prev) => {
          const newMap = new Map(prev);
          const current = newMap.get(file.name);
          if (current) {
            newMap.set(file.name, { ...current, status: 'uploading', progress: 0 });
          }
          return newMap;
        });

        // Upload to S3
        const response = await fetch(photo.presignedUrl.url, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': photo.presignedUrl.contentType,
          },
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        // Update state to completed
        setUploadStates((prev) => {
          const newMap = new Map(prev);
          const current = newMap.get(file.name);
          if (current) {
            newMap.set(file.name, { ...current, status: 'completed', progress: 100 });
          }
          return newMap;
        });
      } catch (error) {
        // Update state to failed
        setUploadStates((prev) => {
          const newMap = new Map(prev);
          const current = newMap.get(file.name);
          if (current) {
            newMap.set(file.name, {
              ...current,
              status: 'failed',
              error: error instanceof Error ? error.message : 'Upload failed',
            });
          }
          return newMap;
        });
      }
    });

    await Promise.all(uploadPromises);
    setIsUploading(false);
  };

  const uploadFiles = useCallback((files: File[]) => {
    initiateUploadMutation.mutate(files);
  }, [initiateUploadMutation]);

  return {
    uploadFiles,
    uploadStates: Array.from(uploadStates.values()),
    isUploading: initiateUploadMutation.isPending,
    error: initiateUploadMutation.error,
  };
}

