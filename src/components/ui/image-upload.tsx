'use client';

import { useCallback, useState, useRef } from 'react';
import { useImageUpload, UploadResult } from '@/hooks/use-image-upload';

interface ImageUploadProps {
  onUpload: (result: UploadResult) => void;
  onError?: (error: string) => void;
  type?: 'articles' | 'branding' | 'media';
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  children?: React.ReactNode;
  multiple?: boolean;
}

export default function ImageUpload({
  onUpload,
  onError,
  type = 'media',
  accept = 'image/*',
  maxSize = 10,
  className = '',
  children,
  multiple = false
}: ImageUploadProps) {
  const { uploadImage, uploadMultipleImages, uploadProgress, error, isUploading } = useImageUpload();
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Only image files are allowed';
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSize}MB`;
    }

    return null;
  }, [maxSize]);

  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Validate all files first
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        const errorMsg = `${file.name}: ${validationError}`;
        onError?.(errorMsg);
        return;
      }
    }

    try {
      if (multiple && fileArray.length > 1) {
        const results = await uploadMultipleImages(fileArray, type);
        results.forEach(result => onUpload(result));
      } else {
        const result = await uploadImage(fileArray[0], type);
        onUpload(result);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      onError?.(errorMsg);
    }
  }, [uploadImage, uploadMultipleImages, validateFile, onUpload, onError, type, multiple]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'pointer-events-none opacity-75' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        {isUploading ? (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Uploading...</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress.progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">
              {Math.round(uploadProgress.progress)}%
            </div>
          </div>
        ) : children ? (
          children
        ) : (
          <div className="space-y-2">
            <div className="text-4xl text-gray-400">📁</div>
            <div className="text-sm text-gray-600">
              {multiple ? 'Drop images here or click to select' : 'Drop an image here or click to select'}
            </div>
            <div className="text-xs text-gray-500">
              Max size: {maxSize}MB • Formats: JPG, PNG, GIF, WebP
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}
    </div>
  );
}

// Specialized components for common use cases
export function FeaturedImageUpload({
  onUpload,
  onError,
  currentImage,
  className = ''
}: {
  onUpload: (result: UploadResult) => void;
  onError?: (error: string) => void;
  currentImage?: string;
  className?: string;
}) {
  return (
    <ImageUpload
      onUpload={onUpload}
      onError={onError}
      type="articles"
      className={className}
    >
      <div className="space-y-2">
        {currentImage ? (
          <div className="space-y-2">
            <img
              src={currentImage}
              alt="Current featured image"
              className="max-w-full h-32 object-cover rounded mx-auto"
            />
            <div className="text-sm text-gray-600">
              Click or drop to replace featured image
            </div>
          </div>
        ) : (
          <>
            <div className="text-4xl text-gray-400">🖼️</div>
            <div className="text-sm text-gray-600">
              Add featured image
            </div>
          </>
        )}
        <div className="text-xs text-gray-500">
          Recommended: 1200x630px • Max: 10MB
        </div>
      </div>
    </ImageUpload>
  );
}

export function ArticleImageUpload({
  onUpload,
  onError,
  className = ''
}: {
  onUpload: (result: UploadResult) => void;
  onError?: (error: string) => void;
  className?: string;
}) {
  return (
    <ImageUpload
      onUpload={onUpload}
      onError={onError}
      type="articles"
      multiple={true}
      className={className}
    >
      <div className="space-y-2">
        <div className="text-4xl text-gray-400">📷</div>
        <div className="text-sm text-gray-600">
          Add images to article
        </div>
        <div className="text-xs text-gray-500">
          Drop multiple images or click to select • Max: 10MB each
        </div>
      </div>
    </ImageUpload>
  );
}