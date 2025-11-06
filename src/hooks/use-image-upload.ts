'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';

export interface UploadResult {
  url: string;
  path: string;
  filename: string;
  size: number;
  type: string;
}

export interface UploadProgress {
  progress: number;
  isUploading: boolean;
}

export function useImageUpload() {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    isUploading: false
  });
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const uploadImage = useCallback(async (
    file: File,
    type: 'articles' | 'branding' | 'media' = 'media'
  ): Promise<UploadResult> => {
    if (!user) {
      throw new Error('Authentication required');
    }

    setError(null);
    setUploadProgress({ progress: 0, isUploading: true });

    try {
      // Get auth token
      const token = await user.getIdToken();

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress({ progress, isUploading: true });
          }
        });

        xhr.addEventListener('load', () => {
          setUploadProgress({ progress: 100, isUploading: false });

          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.success) {
                resolve(response.data);
              } else {
                reject(new Error(response.error || 'Upload failed'));
              }
            } catch (error) {
              reject(new Error('Invalid response format'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          setUploadProgress({ progress: 0, isUploading: false });
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
          setUploadProgress({ progress: 0, isUploading: false });
          reject(new Error('Upload cancelled'));
        });

        xhr.open('POST', '/api/admin/upload');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });

    } catch (error) {
      setUploadProgress({ progress: 0, isUploading: false });
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      throw error;
    }
  }, [user]);

  const uploadMultipleImages = useCallback(async (
    files: File[],
    type: 'articles' | 'branding' | 'media' = 'media'
  ): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await uploadImage(files[i], type);
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload file ${files[i].name}:`, error);
        throw error;
      }
    }

    return results;
  }, [uploadImage]);

  const resetProgress = useCallback(() => {
    setUploadProgress({ progress: 0, isUploading: false });
    setError(null);
  }, []);

  return {
    uploadImage,
    uploadMultipleImages,
    uploadProgress,
    error,
    resetProgress,
    isUploading: uploadProgress.isUploading
  };
}