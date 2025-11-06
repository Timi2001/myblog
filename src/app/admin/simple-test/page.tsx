'use client';

export default function SimpleAdminTest() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Simple Admin Test Page
          </h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h2 className="text-lg font-semibold text-green-800">✅ Success!</h2>
              <p className="text-green-700">
                If you can see this page, the admin routing is working correctly.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="font-semibold text-blue-800">Admin Navigation</h3>
                <ul className="mt-2 space-y-1 text-blue-700">
                  <li><a href="/admin" className="hover:underline">← Back to Login</a></li>
                  <li><a href="/admin/dashboard" className="hover:underline">Dashboard</a></li>
                  <li><a href="/admin/debug" className="hover:underline">Debug Page</a></li>
                  <li><a href="/admin/setup" className="hover:underline">Setup Page</a></li>
                </ul>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <h3 className="font-semibold text-yellow-800">Current Status</h3>
                <ul className="mt-2 space-y-1 text-yellow-700">
                  <li>✅ Admin routing: Working</li>
                  <li>✅ Layout isolation: Working</li>
                  <li>🔄 Analytics: Disabled for admin</li>
                  <li>🔄 Firestore: Rules updated</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
              <h3 className="font-semibold text-gray-800">Next Steps</h3>
              <ol className="mt-2 space-y-1 text-gray-700 list-decimal list-inside">
                <li>Visit <code className="bg-gray-200 px-1 rounded">/admin/setup</code> to create an admin account</li>
                <li>Visit <code className="bg-gray-200 px-1 rounded">/admin</code> to log in</li>
                <li>Visit <code className="bg-gray-200 px-1 rounded">/admin/debug</code> to check authentication status</li>
                <li>Try accessing <code className="bg-gray-200 px-1 rounded">/admin/dashboard</code> after login</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}