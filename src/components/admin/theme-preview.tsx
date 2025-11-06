'use client';

import { useState, useEffect } from 'react';

interface ThemePreviewProps {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  headerStyle: 'modern' | 'classic' | 'minimal';
  layoutStyle: 'grid' | 'list' | 'masonry';
}

export function ThemePreview({
  primaryColor,
  secondaryColor,
  fontFamily,
  headerStyle,
  layoutStyle
}: ThemePreviewProps) {
  const [previewKey, setPreviewKey] = useState(0);

  // Force re-render when props change
  useEffect(() => {
    setPreviewKey(prev => prev + 1);
  }, [primaryColor, secondaryColor, fontFamily, headerStyle, layoutStyle]);

  const previewStyle = {
    '--color-primary': primaryColor,
    '--color-secondary': secondaryColor,
    '--font-family': fontFamily,
  } as React.CSSProperties;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Theme Preview</h4>
      
      <div 
        key={previewKey}
        className={`theme-${headerStyle} layout-${layoutStyle} bg-white rounded border overflow-hidden`}
        style={previewStyle}
      >
        {/* Header Preview */}
        <div className={`p-3 border-b ${getHeaderClasses(headerStyle)}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold" style={{ fontFamily }}>
              Site Name
            </h3>
            <nav className="flex space-x-3 text-sm">
              <span>Home</span>
              <span>About</span>
              <span>Contact</span>
            </nav>
          </div>
        </div>

        {/* Content Preview */}
        <div className="p-3">
          <h4 className="font-semibold mb-2" style={{ color: secondaryColor, fontFamily }}>
            Article Title
          </h4>
          <p className="text-sm text-gray-600 mb-3" style={{ fontFamily }}>
            This is a preview of how your articles will look with the selected theme settings.
          </p>
          
          {/* Layout Preview */}
          <div className={getLayoutClasses(layoutStyle)}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded p-2 text-xs">
                <div 
                  className="w-full h-2 rounded mb-1"
                  style={{ backgroundColor: primaryColor }}
                ></div>
                <div className="text-gray-600">Article {i}</div>
              </div>
            ))}
          </div>

          {/* Button Preview */}
          <div className="mt-3 flex space-x-2">
            <button 
              className="px-3 py-1 rounded text-white text-xs font-medium"
              style={{ backgroundColor: primaryColor }}
            >
              Primary Button
            </button>
            <button 
              className="px-3 py-1 rounded text-white text-xs font-medium"
              style={{ backgroundColor: secondaryColor }}
            >
              Secondary Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getHeaderClasses(headerStyle: string): string {
  switch (headerStyle) {
    case 'modern':
      return 'bg-gradient-to-r from-blue-500 to-purple-600 text-white';
    case 'classic':
      return 'bg-gray-800 text-white border-b-2 border-blue-500';
    case 'minimal':
      return 'bg-white text-gray-900 border-b';
    default:
      return 'bg-white text-gray-900 border-b';
  }
}

function getLayoutClasses(layoutStyle: string): string {
  switch (layoutStyle) {
    case 'grid':
      return 'grid grid-cols-3 gap-2';
    case 'list':
      return 'space-y-2';
    case 'masonry':
      return 'columns-2 gap-2 space-y-2';
    default:
      return 'grid grid-cols-3 gap-2';
  }
}