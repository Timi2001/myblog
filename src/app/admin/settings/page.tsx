'use client';

import { useState, useEffect } from 'react';
import { SiteConfig } from '@/types';
import { siteConfigService } from '@/lib/firestore';
import { ThemePreview } from '@/components/admin/theme-preview';
import { ThemeTemplateSelector } from '@/components/admin/theme-template-selector';

interface SettingsFormData {
  siteName: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  headerStyle: 'modern' | 'classic' | 'minimal';
  layoutStyle: 'grid' | 'list' | 'masonry';
  showSidebar: boolean;
  sidebarPosition: 'left' | 'right';
  articlesPerPage: number;
  showAuthorBio: boolean;
  showRelatedPosts: boolean;
}

export default function AdminSettings() {
  const [formData, setFormData] = useState<SettingsFormData>({
    siteName: '',
    tagline: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1F2937',
    fontFamily: 'Inter',
    headerStyle: 'modern',
    layoutStyle: 'grid',
    showSidebar: true,
    sidebarPosition: 'right',
    articlesPerPage: 10,
    showAuthorBio: true,
    showRelatedPosts: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const [branding, seo, theme, layout] = await Promise.all([
        siteConfigService.getBranding(),
        siteConfigService.getSeo(),
        siteConfigService.getTheme(),
        siteConfigService.getLayout(),
      ]);

      setFormData({
        siteName: branding?.siteName || 'My Personal Blog',
        tagline: branding?.tagline || 'Sharing thoughts and experiences',
        metaTitle: seo?.metaTitle || 'My Personal Blog',
        metaDescription: seo?.metaDescription || 'A personal blog sharing insights, experiences, and knowledge',
        keywords: seo?.keywords?.join(', ') || 'blog, personal, writing, technology',
        primaryColor: theme?.primaryColor || '#3B82F6',
        secondaryColor: theme?.secondaryColor || '#1F2937',
        fontFamily: theme?.fontFamily || 'Inter',
        headerStyle: theme?.headerStyle || 'modern',
        layoutStyle: theme?.layoutStyle || 'grid',
        showSidebar: layout?.showSidebar ?? true,
        sidebarPosition: layout?.sidebarPosition || 'right',
        articlesPerPage: layout?.articlesPerPage || 10,
        showAuthorBio: layout?.showAuthorBio ?? true,
        showRelatedPosts: layout?.showRelatedPosts ?? true,
      });
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Update branding
      await siteConfigService.updateBranding({
        siteName: formData.siteName,
        tagline: formData.tagline,
      });

      // Update SEO
      await siteConfigService.updateSeo({
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
      });

      // Update theme
      await siteConfigService.updateTheme({
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        fontFamily: formData.fontFamily,
        headerStyle: formData.headerStyle,
        layoutStyle: formData.layoutStyle,
      });

      // Update layout
      await siteConfigService.updateLayout({
        showSidebar: formData.showSidebar,
        sidebarPosition: formData.sidebarPosition,
        articlesPerPage: formData.articlesPerPage,
        showAuthorBio: formData.showAuthorBio,
        showRelatedPosts: formData.showRelatedPosts,
      });

      setSuccess('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white shadow rounded-lg p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your site configuration, branding, and layout preferences.
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="text-sm text-green-700">{success}</div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Site Branding */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Site Branding</h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  name="siteName"
                  id="siteName"
                  value={formData.siteName}
                  onChange={handleInputChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="My Personal Blog"
                />
              </div>

              <div>
                <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  name="tagline"
                  id="tagline"
                  value={formData.tagline}
                  onChange={handleInputChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Sharing thoughts and experiences"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="My Personal Blog"
                />
              </div>

              <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  name="metaDescription"
                  id="metaDescription"
                  rows={3}
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="A personal blog sharing insights, experiences, and knowledge"
                />
              </div>

              <div>
                <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  name="keywords"
                  id="keywords"
                  value={formData.keywords}
                  onChange={handleInputChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="blog, personal, writing, technology"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Theme & Appearance</h3>
            
            {/* Theme Templates */}
            <div className="mb-6">
              <ThemeTemplateSelector
                onSelectTemplate={(template) => {
                  setFormData(prev => ({
                    ...prev,
                    primaryColor: template.primaryColor || prev.primaryColor,
                    secondaryColor: template.secondaryColor || prev.secondaryColor,
                    fontFamily: template.fontFamily || prev.fontFamily,
                    headerStyle: template.headerStyle || prev.headerStyle,
                    layoutStyle: template.layoutStyle || prev.layoutStyle,
                  }));
                }}
                currentTheme={{
                  primaryColor: formData.primaryColor,
                  secondaryColor: formData.secondaryColor,
                  fontFamily: formData.fontFamily,
                  headerStyle: formData.headerStyle,
                  layoutStyle: formData.layoutStyle,
                }}
              />
            </div>
            
            {/* Theme Preview */}
            <div className="mb-6">
              <ThemePreview
                primaryColor={formData.primaryColor}
                secondaryColor={formData.secondaryColor}
                fontFamily={formData.fontFamily}
                headerStyle={formData.headerStyle}
                layoutStyle={formData.layoutStyle}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    name="primaryColor"
                    id="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleInputChange}
                    className="h-10 w-20 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="block flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    name="secondaryColor"
                    id="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={handleInputChange}
                    className="h-10 w-20 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="block flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-700 mb-2">
                  Font Family
                </label>
                <select
                  name="fontFamily"
                  id="fontFamily"
                  value={formData.fontFamily}
                  onChange={handleInputChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Montserrat">Montserrat</option>
                </select>
              </div>

              <div>
                <label htmlFor="headerStyle" className="block text-sm font-medium text-gray-700 mb-2">
                  Header Style
                </label>
                <select
                  name="headerStyle"
                  id="headerStyle"
                  value={formData.headerStyle}
                  onChange={handleInputChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Layout Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="layoutStyle" className="block text-sm font-medium text-gray-700 mb-2">
                  Article Layout Style
                </label>
                <select
                  name="layoutStyle"
                  id="layoutStyle"
                  value={formData.layoutStyle}
                  onChange={handleInputChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="grid">Grid</option>
                  <option value="list">List</option>
                  <option value="masonry">Masonry</option>
                </select>
              </div>

              <div>
                <label htmlFor="articlesPerPage" className="block text-sm font-medium text-gray-700 mb-2">
                  Articles Per Page
                </label>
                <input
                  type="number"
                  name="articlesPerPage"
                  id="articlesPerPage"
                  min="1"
                  max="50"
                  value={formData.articlesPerPage}
                  onChange={handleInputChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="sidebarPosition" className="block text-sm font-medium text-gray-700 mb-2">
                  Sidebar Position
                </label>
                <select
                  name="sidebarPosition"
                  id="sidebarPosition"
                  value={formData.sidebarPosition}
                  onChange={handleInputChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="showSidebar"
                    id="showSidebar"
                    checked={formData.showSidebar}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showSidebar" className="ml-2 block text-sm text-gray-900">
                    Show Sidebar
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="showAuthorBio"
                    id="showAuthorBio"
                    checked={formData.showAuthorBio}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showAuthorBio" className="ml-2 block text-sm text-gray-900">
                    Show Author Bio
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="showRelatedPosts"
                    id="showRelatedPosts"
                    checked={formData.showRelatedPosts}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showRelatedPosts" className="ml-2 block text-sm text-gray-900">
                    Show Related Posts
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}