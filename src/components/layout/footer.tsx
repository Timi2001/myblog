'use client';

import Link from 'next/link';
import { NewsletterSignup } from '@/components/ui/newsletter-signup';
import { useSiteConfig } from '@/hooks/use-site-config';

export function Footer() {
  const { config } = useSiteConfig();
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {config.branding.siteName}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base leading-relaxed">
              {config.branding.tagline}
            </p>
          </div>
          
          <div>
            <h4 className="text-base lg:text-lg font-medium text-gray-900 dark:text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm lg:text-base">
              <li>
                <Link 
                  href="/" 
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors inline-block py-1 touch-target"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors inline-block py-1 touch-target"
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors inline-block py-1 touch-target"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  href="/search" 
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors inline-block py-1 touch-target"
                >
                  Search
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="sm:col-span-2 lg:col-span-1">
            <NewsletterSignup 
              variant="compact" 
              className="dark:text-white" 
            />
          </div>
        </div>
        
        <div className="mt-8 lg:mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-sm lg:text-base text-gray-600 dark:text-gray-300">
            © {new Date().getFullYear()} {config.branding.siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}