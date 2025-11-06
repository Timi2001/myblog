'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSiteConfig } from '@/hooks/use-site-config';

interface ThemeContextType {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  headerStyle: 'modern' | 'classic' | 'minimal';
  layoutStyle: 'grid' | 'list' | 'masonry';
  applyTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { config, loading } = useSiteConfig();
  const [themeApplied, setThemeApplied] = useState(false);

  const applyTheme = () => {
    if (loading || themeApplied) return;

    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--color-primary', config.theme.primaryColor);
    root.style.setProperty('--color-secondary', config.theme.secondaryColor);
    
    // Apply font family
    if (config.theme.fontFamily) {
      root.style.setProperty('--font-family', config.theme.fontFamily);
    }
    
    // Add theme classes to body
    document.body.classList.remove('theme-modern', 'theme-classic', 'theme-minimal');
    document.body.classList.add(`theme-${config.theme.headerStyle}`);
    
    document.body.classList.remove('layout-grid', 'layout-list', 'layout-masonry');
    document.body.classList.add(`layout-${config.theme.layoutStyle}`);
    
    setThemeApplied(true);
  };

  useEffect(() => {
    if (!loading) {
      applyTheme();
    }
  }, [loading, config]);

  const contextValue: ThemeContextType = {
    primaryColor: config.theme.primaryColor,
    secondaryColor: config.theme.secondaryColor,
    fontFamily: config.theme.fontFamily,
    headerStyle: config.theme.headerStyle,
    layoutStyle: config.theme.layoutStyle,
    applyTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}