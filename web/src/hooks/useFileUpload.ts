import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/axios';
import { useUploadStore } from '../store/uploadStore';
import { useAuth } from './useAuth';
import type { 
  InitiateUploadRequest, 
  InitiateUploadResponse, 
  PhotoUploadRequest,
  CompleteUploadRequest,
  CompleteUploadResponse
} from '../types/api.types';
import { getFileKey } from '../lib/utils';

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
  const { setCurrentUploadJob, setIsUploading, setUploadProgress, clearUpload } = useUploadStore();
  const queryClient = useQueryClient();
  const [uploadStates, setUploadStates] = useState<Map<string, FileUploadState>>(new Map());

  const updateUploadStates = useCallback((updater: (map: Map<string, FileUploadState>) => void) => {
    setUploadStates((prev) => {
      const next = new Map(prev);
      updater(next);

      const values = Array.from(next.values());
      const overallProgress = values.length
        ? Math.round(values.reduce((sum, state) => sum + state.progress, 0) / values.length)
        : 0;

      setUploadProgress(overallProgress);
      return next;
    });
  }, [setUploadProgress]);

  const clearUploadStates = useCallback(() => {
    setUploadStates(new Map());
    setUploadProgress(0);
    clearUpload();
  }, [clearUpload, setUploadProgress]);

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
      // Validate response data
      if (!data || !data.photos || !Array.isArray(data.photos) || data.photos.length === 0) {
        console.error('Invalid upload response:', data);
        setIsUploading(false);
        return;
      }

      setCurrentUploadJob(data);
      setIsUploading(true);
      setUploadProgress(0);

      // Initialize upload states
      const newStates = new Map<string, FileUploadState>();
      data.photos.forEach((photo, index) => {
        const file = variables[index];
        if (!file) return; // Skip if file doesn't exist
        
        const key = getFileKey(file);
        newStates.set(key, {
          file,
          photoId: photo.photoId,
          status: 'pending',
          progress: 0,
          presignedUrl: photo.presignedUrl?.url || '',
        });
      });
      setUploadStates(() => {
        setUploadProgress(newStates.size ? 0 : 100);
        return newStates;
      });

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
    // Validate response data
    if (!uploadResponse || !uploadResponse.photos || !Array.isArray(uploadResponse.photos) || uploadResponse.photos.length === 0) {
      console.error('Invalid upload response for S3 upload:', uploadResponse);
      setIsUploading(false);
      return;
    }

    const uploadWithProgress = (url: string, contentType: string, file: File, key: string) =>
      new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (!event.lengthComputable) {
            return;
          }
          const percent = Math.round((event.loaded / event.total) * 100);
          updateUploadStates((map) => {
            const current = map.get(key);
            if (current) {
              map.set(key, { ...current, progress: percent });
            }
          });
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error while uploading to S3'));
        });

        xhr.open('PUT', url, true);
        xhr.setRequestHeader('Content-Type', contentType);
        xhr.setRequestHeader('x-amz-server-side-encryption', 'AES256');
        xhr.send(file);
      });

    const uploadResults = await Promise.allSettled(
      uploadResponse.photos.map(async (photo, index) => {
        const file = files[index];
        if (!file) {
          console.warn(`File at index ${index} is undefined`);
          return { success: false, photoId: photo.photoId, error: new Error('File is undefined') };
        }

        // Validate presigned URL
        if (!photo.presignedUrl || !photo.presignedUrl.url) {
          console.error('Missing presigned URL for photo:', photo);
          return { success: false, photoId: photo.photoId, error: new Error('Missing presigned URL') };
        }

        const key = getFileKey(file);

        updateUploadStates((map) => {
          const current = map.get(key);
          const baseState: FileUploadState = current ?? {
            file,
            photoId: photo.photoId,
            status: 'pending',
            progress: 0,
            presignedUrl: photo.presignedUrl?.url,
          };

          map.set(key, {
            ...baseState,
            file,
            photoId: photo.photoId,
            status: 'uploading',
            progress: baseState.progress ?? 0,
            presignedUrl: photo.presignedUrl?.url,
            error: undefined,
          });
        });

        try {
          await uploadWithProgress(
            photo.presignedUrl.url,
            photo.presignedUrl.contentType || file.type,
            file,
            key
          );

          updateUploadStates((map) => {
            const current = map.get(key);
            if (current) {
              map.set(key, { ...current, status: 'completed', progress: 100, error: undefined });
            }
          });

          return { success: true, photoId: photo.photoId };
        } catch (error) {
          updateUploadStates((map) => {
            const current = map.get(key);
            if (current) {
              map.set(key, {
                ...current,
                status: 'failed',
                error: error instanceof Error ? error.message : 'Upload failed',
              });
            }
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
        queryClient.invalidateQueries({ queryKey: ['photos', user?.id] });
      } catch (error) {
        console.error('Failed to complete upload job:', error);
        // Don't fail the entire upload - files are already in S3
      }
    }

    // Refresh gallery even if some uploads failed to reflect current state
    queryClient.invalidateQueries({ queryKey: ['photos', user?.id] });
    
    setIsUploading(false);
  };

  const uploadFiles = useCallback((files: File[]) => {
    initiateUploadMutation.mutate(files);
  }, [initiateUploadMutation]);

  const uploadStateArray = Array.from(uploadStates.values());
  const hasActiveUploads = uploadStateArray.some(
    (state) => state.status === 'pending' || state.status === 'uploading'
  );
  const isUploadingFlag = initiateUploadMutation.isPending || hasActiveUploads;

  return {
    uploadFiles,
    uploadStates: uploadStateArray,
    isUploading: isUploadingFlag,
    error: initiateUploadMutation.error,
    clearUploads: clearUploadStates,
  };
}

