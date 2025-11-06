'use client';

import { useState } from 'react';
import { themeTemplates, ThemeTemplate, applyThemeTemplate } from '@/lib/theme-templates';

interface ThemeTemplateSelectorProps {
  onSelectTemplate: (template: Partial<ThemeTemplate>) => void;
  currentTheme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    headerStyle: 'modern' | 'classic' | 'minimal';
    layoutStyle: 'grid' | 'list' | 'masonry';
  };
}

export function ThemeTemplateSelector({ onSelectTemplate, currentTheme }: ThemeTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleSelectTemplate = (template: ThemeTemplate) => {
    setSelectedTemplate(template.id);
    onSelectTemplate(applyThemeTemplate(template));
  };

  const isCurrentTemplate = (template: ThemeTemplate) => {
    return (
      template.primaryColor === currentTheme.primaryColor &&
      template.secondaryColor === currentTheme.secondaryColor &&
      template.fontFamily === currentTheme.fontFamily &&
      template.headerStyle === currentTheme.headerStyle &&
      template.layoutStyle === currentTheme.layoutStyle
    );
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Theme Templates</h4>
      <p className="text-xs text-gray-500 mb-4">
        Choose from pre-designed themes or customize your own below
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {themeTemplates.map((template) => {
          const isCurrent = isCurrentTemplate(template);
          const isSelected = selectedTemplate === template.id;
          
          return (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                isCurrent || isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              {/* Color Preview */}
              <div className="flex space-x-1 mb-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: template.primaryColor }}
                ></div>
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: template.secondaryColor }}
                ></div>
              </div>
              
              {/* Template Info */}
              <div className="text-xs">
                <div className="font-medium text-gray-900 mb-1">
                  {template.name}
                </div>
                <div className="text-gray-500 line-clamp-2">
                  {template.description}
                </div>
                <div className="mt-1 text-gray-400">
                  {template.fontFamily} • {template.headerStyle}
                </div>
              </div>
              
              {isCurrent && (
                <div className="mt-2 text-xs text-blue-600 font-medium">
                  Current Theme
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        💡 Tip: Select a template to quickly apply its settings, then customize individual options below
      </div>
    </div>
  );
}