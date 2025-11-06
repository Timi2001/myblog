import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/contexts/theme-context";
import { WebsiteStructuredData, OrganizationStructuredData } from "@/components/seo/structured-data";
import { generateSiteMetadata } from "@/lib/metadata";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { ConditionalLayout } from "@/components/layout/conditional-layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  return generateSiteMetadata();
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  return (
    <html lang="en" itemScope itemType="https://schema.org/WebSite">
      <head>
        {/* Structured Data */}
        <WebsiteStructuredData
          siteName="EconHub"
          siteUrl={baseUrl}
          description="Your hub for economic insights, analysis, and financial knowledge"
        />
        <OrganizationStructuredData
          name="EconHub"
          url={baseUrl}
          description="Your hub for economic insights, analysis, and financial knowledge"
          logo={`${baseUrl}/logo.png`}
        />
        
        {/* RSS Feed Discovery */}
        <link 
          rel="alternate" 
          type="application/rss+xml" 
          title="EconHub RSS Feed"
          href={`${baseUrl}/rss.xml`} 
        />
        
        {/* Sitemap Reference */}
        <link rel="sitemap" type="application/xml" href={`${baseUrl}/sitemap.xml`} />
        
        {/* Favicon and Icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        
        {/* Preconnect for Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        
        {/* Theme and App Configuration */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="application-name" content="EconHub" />
        <meta name="apple-mobile-web-app-title" content="EconHub" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Security Headers - Note: X-Frame-Options is set as HTTP header in next.config.ts */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <ThemeProvider>
          <AnalyticsProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
