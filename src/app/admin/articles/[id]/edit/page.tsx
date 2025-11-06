'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Article, Category, UpdateArticleInput } from '@/types';
import EnhancedRichTextEditor from '@/components/ui/enhanced-rich-text-editor';
import { FeaturedImageUpload } from '@/components/ui/image-upload';
import { useAutoSave } from '@/hooks/use-auto-save';
import { slugify } from '@/utils/slugify';

interface EditArticleProps {
  params: { id: string };
}

export default function EditArticle({ params }: EditArticleProps) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  
  const [formData, setFormData] = useState<UpdateArticleInput>({
    id: params.id,
    title: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    categoryId: '',
    tags: [],
    status: 'draft',
    metaTitle: '',
    metaDescription: '',
  });

  const [tagInput, setTagInput] = useState('');

  // Auto-save functionality
  const handleAutoSave = async (data: UpdateArticleInput) => {
    if (!data.title?.trim()) return; // Don't auto-save empty articles
    
    try {
      setAutoSaving(true);
      const response = await fetch('/api/admin/articles/auto-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...data, 
          id: params.id,
          status: data.status || 'draft' 
        }),
      });

      if (response.ok) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  // Handle word count changes from the editor
  const handleWordCountChange = (words: number, chars: number, readTime: number) => {
    setWordCount(words);
    setReadingTime(readTime);
  };

  const { save: manualSave } = useAutoSave({
    data: formData,
    onSave: handleAutoSave,
    delay: 30000, // 30 seconds
    enabled: (formData.title?.trim().length || 0) > 0,
  });

  useEffect(() => {
    fetchArticle();
    fetchCategories();
  }, [params.id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/articles/${params.id}`);
      const result = await response.json();
      
      if (result.success) {
        const articleData = result.data;
        setArticle(articleData);
        setFormData({
          id: params.id,
          title: articleData.title || '',
          content: articleData.content || '',
          excerpt: articleData.excerpt || '',
          featuredImage: articleData.featuredImage || '',
          categoryId: articleData.categoryId || '',
          tags: articleData.tags || [],
          status: articleData.status || 'draft',
          metaTitle: articleData.metaTitle || '',
          metaDescription: articleData.metaDescription || '',
        });
      } else {
        setError(result.error || 'Article not found');
      }
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Failed to fetch article');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !(formData.tags || []).includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), tag],
        }));
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent, status?: 'draft' | 'published' | 'archived') => {
    e.preventDefault();
    
    if (!formData.title?.trim() || !formData.content?.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const submitData = {
        ...formData,
        status: status || formData.status,
        metaTitle: formData.metaTitle || formData.title,
        metaDescription: formData.metaDescription || formData.excerpt,
      };

      const response = await fetch(`/api/admin/articles/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        router.push('/admin/articles');
      } else {
        setError(result.error || 'Failed to update article');
      }
    } catch (err) {
      console.error('Error updating article:', err);
      setError('Failed to update article');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !article) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Link
                  href="/admin/articles"
                  className="text-sm font-medium text-red-800 hover:text-red-600"
                >
                  ← Back to Articles
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/articles"
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
            {article && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                article.status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : article.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {article.status}
              </span>
            )}
          </div>
          
          {/* Auto-save status and stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{readingTime} min read</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {autoSaving && (
                <div className="flex items-center space-x-1 text-blue-600">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </div>
              )}
              {lastSaved && !autoSaving && (
                <div className="flex items-center space-x-1 text-green-600">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form className="space-y-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter article title"
                />
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Content *
                </label>
                <div className="mt-1">
                  <EnhancedRichTextEditor
                    content={formData.content || ''}
                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                    placeholder="Write your article content here..."
                    onWordCountChange={handleWordCountChange}
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                  Excerpt
                </label>
                <textarea
                  name="excerpt"
                  id="excerpt"
                  rows={3}
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Brief description of the article (optional)"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="categoryId"
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <FeaturedImageUpload
                      onUpload={(result) => {
                        setFormData(prev => ({ ...prev, featuredImage: result.url }));
                      }}
                      onError={(error) => setError(error)}
                      currentImage={formData.featuredImage}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="featuredImageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                      Or enter image URL
                    </label>
                    <input
                      type="url"
                      name="featuredImage"
                      id="featuredImageUrl"
                      value={formData.featuredImage}
                      onChange={handleInputChange}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      You can upload an image above or paste a URL here
                    </p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  id="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  Tags
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Type a tag and press Enter or comma"
                  />
                  {(formData.tags || []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(formData.tags || []).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none"
                          >
                            <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 8 8">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M1 1l6 6m0-6L1 7" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">SEO & Metadata</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">
                  Meta Title
                  <span className="text-xs text-gray-500 ml-2">
                    ({(formData.metaTitle || formData.title || '').length}/60 characters)
                  </span>
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={formData.title || "Enter SEO title"}
                  maxLength={60}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Optimal length: 50-60 characters. Will use article title if empty.
                </p>
              </div>

              <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">
                  Meta Description
                  <span className="text-xs text-gray-500 ml-2">
                    ({(formData.metaDescription || formData.excerpt || '').length}/160 characters)
                  </span>
                </label>
                <textarea
                  name="metaDescription"
                  id="metaDescription"
                  rows={3}
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={formData.excerpt || "Enter SEO description"}
                  maxLength={160}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Optimal length: 150-160 characters. Will use excerpt if empty.
                </p>
              </div>

              {/* SEO Preview */}
              <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Search Engine Preview</h4>
                <div className="space-y-1">
                  <div className="text-blue-600 text-lg font-medium truncate">
                    {formData.metaTitle || formData.title || 'Article Title'}
                  </div>
                  <div className="text-green-700 text-sm truncate">
                    yoursite.com/articles/{article?.slug || (formData.title ? slugify(formData.title) : 'article-slug')}
                  </div>
                  <div className="text-gray-600 text-sm line-clamp-2">
                    {formData.metaDescription || formData.excerpt || 'Article description will appear here...'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <div>
            {article?.status === 'published' && (
              <Link
                href={`/articles/${article.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Article
              </Link>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Link
              href="/admin/articles"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Link>
            
            {formData.status !== 'draft' && (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'draft')}
                disabled={saving}
                className="bg-gray-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save as Draft'}
              </button>
            )}
            
            <button
              type="button"
              onClick={(e) => handleSubmit(e)}
              disabled={saving}
              className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}