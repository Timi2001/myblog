'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOutAdmin } from '@/lib/auth';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== '/admin') {
      // Redirect to login if not authenticated and not on login page
      router.push('/admin');
    } else if (!loading && user && pathname === '/admin') {
      // Redirect to dashboard if authenticated and on login page
      console.log('✅ User authenticated, redirecting to dashboard');
      router.push('/admin/dashboard');
    }
  }, [user, loading, router, pathname]);

  const handleSignOut = async () => {
    try {
      await signOutAdmin();
      router.push('/admin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user && pathname !== '/admin') {
    return null; // Will redirect via useEffect
  }

  // Don't show admin layout on the login page
  if (pathname === '/admin') {
    return <>{children}</>;
  }

  const navigationItems = [
    { name: 'Dashboard', href: '/admin/dashboard', current: pathname === '/admin/dashboard' },
    { name: 'Articles', href: '/admin/articles', current: pathname.startsWith('/admin/articles') },
    { name: 'Categories', href: '/admin/categories', current: pathname.startsWith('/admin/categories') },
    { name: 'Comments', href: '/admin/comments', current: pathname.startsWith('/admin/comments') },
    { name: 'Media', href: '/admin/media', current: pathname.startsWith('/admin/media') },
    { name: 'Newsletter', href: '/admin/newsletter', current: pathname.startsWith('/admin/newsletter') },
    { name: 'Analytics', href: '/admin/analytics', current: pathname.startsWith('/admin/analytics') },
    { name: 'Feeds', href: '/admin/feeds', current: pathname.startsWith('/admin/feeds') },
    { name: 'Customize', href: '/admin/customize', current: pathname.startsWith('/admin/customize') },
    { name: 'Settings', href: '/admin/settings', current: pathname.startsWith('/admin/settings') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/admin/dashboard" className="text-lg sm:text-xl font-bold text-gray-900">
                  Admin Panel
                </Link>
              </div>
              <div className="hidden lg:ml-6 lg:flex lg:space-x-6 xl:space-x-8">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:block text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                View Site
              </Link>
              <span className="hidden md:block text-sm text-gray-700 truncate max-w-[150px]">
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium touch-target"
              >
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="lg:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  item.current
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                } block pl-3 pr-4 py-3 border-l-4 text-base font-medium touch-target`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile-only links */}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="block pl-3 pr-4 py-3 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 touch-target"
              >
                View Site
              </Link>
              <div className="pl-3 pr-4 py-2 text-sm text-gray-500 truncate">
                {user?.email}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}