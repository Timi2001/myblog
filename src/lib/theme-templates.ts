export interface ThemeTemplate {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  headerStyle: 'modern' | 'classic' | 'minimal';
  layoutStyle: 'grid' | 'list' | 'masonry';
}

export const themeTemplates: ThemeTemplate[] = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    description: 'Clean and modern design with blue accents',
    primaryColor: '#3B82F6',
    secondaryColor: '#1F2937',
    fontFamily: 'Inter',
    headerStyle: 'modern',
    layoutStyle: 'grid',
  },
  {
    id: 'classic-navy',
    name: 'Classic Navy',
    description: 'Traditional blog layout with navy theme',
    primaryColor: '#1E40AF',
    secondaryColor: '#374151',
    fontFamily: 'Roboto',
    headerStyle: 'classic',
    layoutStyle: 'list',
  },
  {
    id: 'minimal-green',
    name: 'Minimal Green',
    description: 'Clean minimal design with green highlights',
    primaryColor: '#10B981',
    secondaryColor: '#6B7280',
    fontFamily: 'Inter',
    headerStyle: 'minimal',
    layoutStyle: 'grid',
  },
  {
    id: 'elegant-purple',
    name: 'Elegant Purple',
    description: 'Sophisticated purple theme with modern layout',
    primaryColor: '#8B5CF6',
    secondaryColor: '#4C1D95',
    fontFamily: 'Poppins',
    headerStyle: 'modern',
    layoutStyle: 'masonry',
  },
  {
    id: 'warm-orange',
    name: 'Warm Orange',
    description: 'Friendly orange theme with classic styling',
    primaryColor: '#F59E0B',
    secondaryColor: '#92400E',
    fontFamily: 'Open Sans',
    headerStyle: 'classic',
    layoutStyle: 'grid',
  },
  {
    id: 'tech-cyan',
    name: 'Tech Cyan',
    description: 'Modern tech-focused theme with cyan accents',
    primaryColor: '#06B6D4',
    secondaryColor: '#0F172A',
    fontFamily: 'Montserrat',
    headerStyle: 'modern',
    layoutStyle: 'list',
  },
  {
    id: 'creative-pink',
    name: 'Creative Pink',
    description: 'Creative and vibrant pink theme',
    primaryColor: '#EC4899',
    secondaryColor: '#BE185D',
    fontFamily: 'Lato',
    headerStyle: 'minimal',
    layoutStyle: 'masonry',
  },
  {
    id: 'professional-gray',
    name: 'Professional Gray',
    description: 'Professional monochrome theme',
    primaryColor: '#6B7280',
    secondaryColor: '#374151',
    fontFamily: 'Inter',
    headerStyle: 'classic',
    layoutStyle: 'list',
  },
];

export function getThemeTemplate(id: string): ThemeTemplate | undefined {
  return themeTemplates.find(template => template.id === id);
}

export function applyThemeTemplate(template: ThemeTemplate) {
  return {
    primaryColor: template.primaryColor,
    secondaryColor: template.secondaryColor,
    fontFamily: template.fontFamily,
    headerStyle: template.headerStyle,
    layoutStyle: template.layoutStyle,
  };
}