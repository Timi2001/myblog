'use client';

import { useState } from 'react';
import MediaLibrary from '@/components/admin/media-library';

export default function MediaPage() {
  const [selectedType, setSelectedType] = useState<'articles' | 'branding' | 'media'>('media');

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          
          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <label htmlFor="type-filter" className="text-sm font-medium text-gray-700">
              Filter by type:
            </label>
            <select
              id="type-filter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="media">General Media</option>
              <option value="articles">Article Images</option>
              <option value="branding">Branding Assets</option>
            </select>
          </div>
        </div>
        
        <p className="mt-2 text-sm text-gray-600">
          Manage your uploaded images and media files. Upload new images, organize existing ones, and copy URLs for use in your content.
        </p>
      </div>

      {/* Media Library */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <MediaLibrary type={selectedType} />
        </div>
      </div>
    </div>
  );
}