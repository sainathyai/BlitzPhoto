/**
 * API Types
 * 
 * TypeScript types for API requests and responses.
 * Shared with web application.
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

export interface CompleteUploadRequest {
  uploadJobId: string;
  userId: string;
}

export interface CompleteUploadResponse {
  uploadJobId: string;
  userId: string;
  status: string;
  message: string;
  completedAt: string;
}

export type DeleteStatus = 'DELETED' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'FAILED';

export interface DeletePhotosRequest {
  photoIds: string[];
}

export interface PhotoDeleteResult {
  photoId: string;
  status: DeleteStatus;
  message: string;
}

export interface DeletePhotosResponse {
  requestedCount: number;
  deletedCount: number;
  results: PhotoDeleteResult[];
}

export interface PhotoStatusResponse {
  photoId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  status: string;
  s3Key: string;
  photoUrl: string | null;
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
  emailOrUsername: string;
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
  tokenType?: string;
  expiresIn?: number;
  userId: string;
  email: string;
  username: string;
  issuedAt?: string;
  expiresAt: string;
}

// User info from AuthResponse (minimal fields)
export type AuthUser = {
  id: string;
  email: string;
  username: string;
};

export interface User {
  id: string;
  email: string;
  username: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

