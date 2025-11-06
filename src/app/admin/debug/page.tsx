'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { signOutAdmin } from '@/lib/auth';

export default function AdminDebugPage() {
  const { user, loading, token } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOutAdmin();
      router.push('/admin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Debug Page</h1>
        <p className="mt-1 text-sm text-gray-600">
          Debug information for admin authentication
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Status</h3>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? 'Authenticated' : 'Not authenticated'}</p>
            <p><strong>User Email:</strong> {user?.email || 'N/A'}</p>
            <p><strong>User UID:</strong> {user?.uid || 'N/A'}</p>
            <p><strong>Token:</strong> {token ? 'Present' : 'Not present'}</p>
            <p><strong>Token Length:</strong> {token?.length || 0}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Environment Variables</h3>
          <div className="space-y-2">
            <p><strong>Firebase Project ID:</strong> {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not set'}</p>
            <p><strong>Firebase Auth Domain:</strong> {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Not set'}</p>
            <p><strong>Firebase API Key:</strong> {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not set'}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Navigation Test</h3>
          <div className="space-y-2">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium mr-2"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => router.push('/admin')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium mr-2"
            >
              Go to Login
            </button>
            {user && (
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Current URL</h3>
          <p className="text-sm text-gray-600">{typeof window !== 'undefined' ? window.location.href : 'Server-side'}</p>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">User Object (Raw)</h3>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}