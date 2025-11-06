'use client';

import { useState, useEffect } from 'react';

interface SiteConfig {
  branding: {
    siteName: string;
    tagline: string;
    logo?: string;
    favicon?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    googleAnalyticsId?: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    headerStyle: 'modern' | 'classic' | 'minimal';
    layoutStyle: 'grid' | 'list' | 'masonry';
  };
  layout: {
    showSidebar: boolean;
    sidebarPosition: 'left' | 'right';
    articlesPerPage: number;
    showAuthorBio: boolean;
    showRelatedPosts: boolean;
  };
}

const defaultConfig: SiteConfig = {
  branding: {
    siteName: 'My Personal Blog',
    tagline: 'Sharing thoughts and experiences',
  },
  seo: {
    metaTitle: 'My Personal Blog',
    metaDescription: 'A personal blog sharing insights, experiences, and knowledge',
    keywords: ['blog', 'personal', 'writing', 'technology'],
  },
  theme: {
    primaryColor: '#3B82F6',
    secondaryColor: '#1F2937',
    fontFamily: 'Inter',
    headerStyle: 'modern',
    layoutStyle: 'grid',
  },
  layout: {
    showSidebar: true,
    sidebarPosition: 'right',
    articlesPerPage: 10,
    showAuthorBio: true,
    showRelatedPosts: true,
  },
};

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/site/config');
      const result = await response.json();

      if (result.success) {
        setConfig(result.data);
      } else {
        setError('Failed to load site configuration');
        setConfig(defaultConfig);
      }
    } catch (err) {
      console.error('Error fetching site config:', err);
      setError('Failed to load site configuration');
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  const refreshConfig = () => {
    fetchConfig();
  };

  return {
    config,
    loading,
    error,
    refreshConfig,
  };
}

export type { SiteConfig };