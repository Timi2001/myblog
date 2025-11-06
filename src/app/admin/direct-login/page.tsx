'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function DirectAdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔐 Attempting direct Firebase login with:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      console.log('✅ Login successful:', userCredential.user.email);
      console.log('🎯 User UID:', userCredential.user.uid);
      
      setSuccess(`🎉 Login successful! Welcome ${userCredential.user.email}`);
      
      // Get the ID token for debugging
      const token = await userCredential.user.getIdToken();
      console.log('🔑 ID Token received (length):', token.length);
      
      // Set cookie manually
      document.cookie = `auth-token=${token}; path=/; max-age=3600; secure; samesite=strict`;
      
      // Manual redirect after 3 seconds
      setTimeout(() => {
        console.log('🚀 Redirecting to dashboard...');
        window.location.href = '/admin/dashboard';
      }, 3000);
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      setError(`Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            🔐 Direct Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Direct Firebase authentication - no auth context, no CSP blocking
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              ✅ This page completely bypasses auth context and CSP issues
            </p>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">❌ {error}</div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">✅ {success}</div>
              <div className="text-xs text-green-600 mt-1">Redirecting to dashboard...</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                '🚀 Sign in'
              )}
            </button>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Debug pages:{' '}
              <a href="/admin/bypass" className="font-medium text-blue-600 hover:text-blue-500">
                Bypass
              </a>
              {' | '}
              <a href="/admin/debug" className="font-medium text-blue-600 hover:text-blue-500">
                Debug
              </a>
            </p>
          </div>
        </form>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">🔧 Environment Check</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Project ID:</strong> {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '❌ Not set'}</p>
            <p><strong>Auth Domain:</strong> {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '❌ Not set'}</p>
            <p><strong>API Key:</strong> {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Not set'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}