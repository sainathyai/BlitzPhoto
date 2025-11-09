import { create } from 'zustand';
import type { InitiateUploadResponse, UploadJobStatusResponse } from '../types/api.types';

interface UploadState {
  currentUploadJob: InitiateUploadResponse | null;
  uploadStatus: UploadJobStatusResponse | null;
  isUploading: boolean;
  uploadProgress: number;
  setCurrentUploadJob: (job: InitiateUploadResponse | null) => void;
  setUploadStatus: (status: UploadJobStatusResponse | null) => void;
  setIsUploading: (isUploading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  clearUpload: () => void;
}

/**
 * Upload Store
 * 
 * Zustand store for managing upload state and progress.
 */
export const useUploadStore = create<UploadState>((set) => ({
  currentUploadJob: null,
  uploadStatus: null,
  isUploading: false,
  uploadProgress: 0,
  
  setCurrentUploadJob: (job) => {
    set({ currentUploadJob: job });
  },
  
  setUploadStatus: (status) => {
    set({ uploadStatus: status });
  },
  
  setIsUploading: (isUploading) => {
    set({ isUploading });
  },
  
  setUploadProgress: (progress) => {
    set({ uploadProgress: progress });
  },
  
  clearUpload: () => {
    set({
      currentUploadJob: null,
      uploadStatus: null,
      isUploading: false,
      uploadProgress: 0,
    });
  },
}));

