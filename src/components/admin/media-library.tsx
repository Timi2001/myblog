'use client';

import { useState, useEffect, useCallback } from 'react';
import { listImages, deleteImage, formatFileSize, ImageMetadata } from '@/lib/storage';
import { useImageUpload } from '@/hooks/use-image-upload';
import ImageUpload from '@/components/ui/image-upload';

interface MediaLibraryProps {
  onSelectImage?: (imageUrl: string, imageName?: string) => void;
  type?: 'articles' | 'branding' | 'media';
  selectionMode?: boolean;
}

export default function MediaLibrary({ 
  onSelectImage, 
  type = 'media',
  selectionMode = false 
}: MediaLibraryProps) {
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { uploadImage } = useImageUpload();

  const loadImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const imageList = await listImages(type);
      setImages(imageList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);



  const handleDelete = useCallback(async (imagePath: string) => {
    try {
      await deleteImage(imagePath);
      await loadImages(); // Refresh the list
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }, [loadImages]);

  const handleImageSelect = useCallback((imageUrl: string, imageName?: string) => {
    if (selectionMode && onSelectImage) {
      onSelectImage(imageUrl, imageName);
    } else {
      setSelectedImage(selectedImage === imageUrl ? null : imageUrl);
    }
  }, [selectionMode, onSelectImage, selectedImage]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading images...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-medium mb-4">Upload New Image</h3>
        <ImageUpload
          onUpload={() => {
            loadImages(); // Refresh after upload
          }}
          onError={setError}
          type={type}
          className="max-w-md"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Images Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">
            Media Library ({images.length} images)
          </h3>
          <button
            onClick={loadImages}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
        </div>

        {images.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No images uploaded yet. Upload your first image above.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {images.map((image) => (
              <div
                key={image.fullPath}
                className={`
                  relative group border-2 rounded-lg overflow-hidden cursor-pointer
                  transition-all duration-200
                  ${selectedImage === image.downloadURL 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                  ${selectionMode ? 'hover:border-blue-400' : ''}
                `}
                onClick={() => handleImageSelect(image.downloadURL, image.name)}
              >
                <div className="aspect-square">
                  <img
                    src={image.downloadURL}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(image.downloadURL);
                      }}
                      className="bg-white text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-100"
                      title="Copy URL"
                    >
                      Copy
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(image.fullPath);
                      }}
                      className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Selection indicator */}
                {selectionMode && selectedImage === image.downloadURL && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Details Panel */}
      {selectedImage && !selectionMode && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Image Details</h3>
          {(() => {
            const image = images.find(img => img.downloadURL === selectedImage);
            if (!image) return null;
            
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={image.downloadURL}
                    alt={image.name}
                    className="w-full max-w-md rounded-lg border"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Filename</label>
                    <div className="text-sm text-gray-900">{image.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Size</label>
                    <div className="text-sm text-gray-900">{formatFileSize(image.size)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <div className="text-sm text-gray-900">{image.contentType}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Uploaded</label>
                    <div className="text-sm text-gray-900">
                      {new Date(image.timeCreated).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={image.downloadURL}
                        readOnly
                        className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 bg-gray-50"
                      />
                      <button
                        onClick={() => copyToClipboard(image.downloadURL)}
                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this image? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}