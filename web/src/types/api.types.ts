/**
 * API Types
 * 
 * TypeScript types for API requests and responses.
 */

export interface PhotoUploadRequest {
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export interface PresignedUrl {
  url: string;
  expiresAt: string;
  httpMethod: string;
  contentType: string;
  contentLength: number | null;
}

export interface PhotoUploadResponse {
  photoId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  s3Key: string;
  presignedUrl: PresignedUrl;
  requiresMultipart: boolean;
}

export interface InitiateUploadRequest {
  userId: string;
  photos: PhotoUploadRequest[];
}

export interface InitiateUploadResponse {
  uploadJobId: string;
  userId: string;
  status: string;
  photos: PhotoUploadResponse[];
  createdAt: string;
  expiresAt: string;
}

export interface PhotoStatusResponse {
  photoId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  status: string;
  s3Key: string;
  errorMessage: string | null;
  uploadedAt: string | null;
  processedAt: string | null;
  createdAt: string;
}

export interface UploadJobStatusResponse {
  uploadJobId: string;
  userId: string;
  status: string;
  progressPercentage: number;
  totalPhotos: number;
  completedPhotos: number;
  failedPhotos: number;
  inProgressPhotos: number;
  photos: PhotoStatusResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
  expiresAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

