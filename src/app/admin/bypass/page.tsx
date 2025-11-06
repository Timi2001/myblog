'use client';

export default function AdminBypassPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Admin Bypass Test
          </h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h2 className="text-lg font-semibold text-green-800">✅ Success!</h2>
              <p className="text-green-700">
                This page completely bypasses authentication and should always work.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-semibold text-blue-800">Environment Check</h3>
              <div className="mt-2 space-y-1 text-blue-700">
                <p><strong>Firebase Project ID:</strong> {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not set'}</p>
                <p><strong>Firebase Auth Domain:</strong> {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Not set'}</p>
                <p><strong>Firebase API Key:</strong> {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Set' : 'Not set'}</p>
                <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Server-side'}</p>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h3 className="font-semibold text-yellow-800">Navigation Test</h3>
              <div className="mt-2 space-y-2">
                <div>
                  <a 
                    href="/admin" 
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium mr-2"
                  >
                    Go to Admin Login
                  </a>
                </div>
                <div>
                  <a 
                    href="/admin/simple-test" 
                    className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium mr-2"
                  >
                    Go to Simple Test
                  </a>
                </div>
                <div>
                  <a 
                    href="/admin/setup" 
                    className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium mr-2"
                  >
                    Go to Setup
                  </a>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
              <h3 className="font-semibold text-gray-800">Diagnosis</h3>
              <p className="mt-2 text-gray-700">
                If you can see this page but the regular admin pages show a loading spinner, 
                the issue is with the AuthProvider getting stuck in loading state.
              </p>
              <p className="mt-2 text-gray-700">
                Check the browser console for any Firebase initialization errors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}