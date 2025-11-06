'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { validateSEO } from '@/hooks/use-seo';

const seoSchema = z.object({
  metaTitle: z.string().min(1, 'Meta title is required').max(60, 'Meta title should be 60 characters or less'),
  metaDescription: z.string().min(120, 'Meta description should be at least 120 characters').max(160, 'Meta description should be 160 characters or less'),
  keywords: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  googleSiteVerification: z.string().optional(),
  bingVerification: z.string().optional(),
  yandexVerification: z.string().optional(),
  facebookAppId: z.string().optional(),
  twitterHandle: z.string().optional(),
  canonicalUrl: z.string().url().optional().or(z.literal('')),
  robotsTxt: z.string().optional(),
});

type SEOFormData = z.infer<typeof seoSchema>;

interface SEOSettingsProps {
  className?: string;
}

export function SEOSettings({ className = '' }: SEOSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [seoValidation, setSeoValidation] = useState<{ isValid: boolean; errors: string[] } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SEOFormData>({
    resolver: zodResolver(seoSchema),
  });

  const watchedValues = watch();

  // Load current SEO settings
  useEffect(() => {
    loadSEOSettings();
  }, []);

  // Validate SEO in real-time
  useEffect(() => {
    if (watchedValues.metaTitle && watchedValues.metaDescription) {
      const validation = validateSEO({
        title: watchedValues.metaTitle,
        description: watchedValues.metaDescription,
        keywords: watchedValues.keywords ? watchedValues.keywords.split(',').map(k => k.trim()) : [],
      });
      setSeoValidation(validation);
    }
  }, [watchedValues.metaTitle, watchedValues.metaDescription, watchedValues.keywords]);

  const loadSEOSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/seo');
      const data = await response.json();
      
      if (data.success && data.data) {
        const seoData = data.data;
        setValue('metaTitle', seoData.metaTitle || '');
        setValue('metaDescription', seoData.metaDescription || '');
        setValue('keywords', seoData.keywords?.join(', ') || '');
        setValue('googleAnalyticsId', seoData.googleAnalyticsId || '');
        setValue('googleSiteVerification', seoData.googleSiteVerification || '');
        setValue('bingVerification', seoData.bingVerification || '');
        setValue('yandexVerification', seoData.yandexVerification || '');
        setValue('facebookAppId', seoData.facebookAppId || '');
        setValue('twitterHandle', seoData.twitterHandle || '');
        setValue('canonicalUrl', seoData.canonicalUrl || '');
        setValue('robotsTxt', seoData.robotsTxt || '');
      }
    } catch (error) {
      console.error('Error loading SEO settings:', error);
      setMessage({ type: 'error', text: 'Failed to load SEO settings' });
    }
  };

  const onSubmit = async (data: SEOFormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const seoData = {
        ...data,
        keywords: data.keywords ? data.keywords.split(',').map(k => k.trim()).filter(Boolean) : [],
      };

      const response = await fetch('/api/admin/settings/seo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(seoData),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'SEO settings updated successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update SEO settings' });
      }
    } catch (error) {
      console.error('Error updating SEO settings:', error);
      setMessage({ type: 'error', text: 'Failed to update SEO settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSitemap = async () => {
    try {
      const response = await fetch('/api/admin/seo/generate-sitemap', {
        method: 'POST',
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Sitemap generated successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to generate sitemap' });
      }
    } catch (error) {
      console.error('Error generating sitemap:', error);
      setMessage({ type: 'error', text: 'Failed to generate sitemap' });
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            SEO Settings
          </h2>
          <button
            onClick={generateSitemap}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Generate Sitemap
          </button>
        </div>

        {/* SEO Validation Status */}
        {seoValidation && (
          <div className={`mb-6 p-4 rounded-md ${
            seoValidation.isValid 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {seoValidation.isValid ? (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">
                  {seoValidation.isValid ? 'SEO Configuration Valid' : 'SEO Recommendations'}
                </h3>
                {!seoValidation.isValid && (
                  <ul className="mt-2 text-sm list-disc list-inside">
                    {seoValidation.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic SEO Settings */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meta Title *
              </label>
              <input
                type="text"
                id="metaTitle"
                {...register('metaTitle')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Your site's main title"
              />
              {errors.metaTitle && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.metaTitle.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {watchedValues.metaTitle?.length || 0}/60 characters
              </p>
            </div>

            <div>
              <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meta Description *
              </label>
              <textarea
                id="metaDescription"
                rows={3}
                {...register('metaDescription')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-vertical"
                placeholder="A brief description of your site"
              />
              {errors.metaDescription && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.metaDescription.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {watchedValues.metaDescription?.length || 0}/160 characters
              </p>
            </div>

            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Keywords
              </label>
              <input
                type="text"
                id="keywords"
                {...register('keywords')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="keyword1, keyword2, keyword3"
              />
              <p className="mt-1 text-sm text-gray-500">
                Separate keywords with commas. Recommended: 5-10 keywords.
              </p>
            </div>
          </div>

          {/* Analytics and Verification */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Analytics & Verification
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="googleAnalyticsId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  id="googleAnalyticsId"
                  {...register('googleAnalyticsId')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>

              <div>
                <label htmlFor="googleSiteVerification" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Google Site Verification
                </label>
                <input
                  type="text"
                  id="googleSiteVerification"
                  {...register('googleSiteVerification')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Verification code"
                />
              </div>

              <div>
                <label htmlFor="bingVerification" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bing Verification
                </label>
                <input
                  type="text"
                  id="bingVerification"
                  {...register('bingVerification')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Verification code"
                />
              </div>

              <div>
                <label htmlFor="yandexVerification" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Yandex Verification
                </label>
                <input
                  type="text"
                  id="yandexVerification"
                  {...register('yandexVerification')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Verification code"
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Social Media
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="facebookAppId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Facebook App ID
                </label>
                <input
                  type="text"
                  id="facebookAppId"
                  {...register('facebookAppId')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="123456789012345"
                />
              </div>

              <div>
                <label htmlFor="twitterHandle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Twitter Handle
                </label>
                <input
                  type="text"
                  id="twitterHandle"
                  {...register('twitterHandle')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="@yourblog"
                />
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Advanced Settings
            </h3>
            
            <div>
              <label htmlFor="canonicalUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Canonical URL
              </label>
              <input
                type="url"
                id="canonicalUrl"
                {...register('canonicalUrl')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="https://yourdomain.com"
              />
              {errors.canonicalUrl && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.canonicalUrl.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Leave empty to use the current domain
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View Sitemap
              </a>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View Robots.txt
              </a>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save SEO Settings'}
            </button>
          </div>
        </form>

        {/* Status Messages */}
        {message && (
          <div className={`mt-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {message.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}