'use client';

import { useEffect, useState } from 'react';

export default function SecurityTestPage() {
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [consoleErrors, setConsoleErrors] = useState<string[]>([]);

  useEffect(() => {
    // Capture console errors
    const originalError = console.error;
    const capturedErrors: string[] = [];
    
    console.error = (...args) => {
      const errorMessage = args.join(' ');
      if (errorMessage.includes('X-Frame-Options')) {
        capturedErrors.push(errorMessage);
        setConsoleErrors(prev => [...prev, errorMessage]);
      }
      originalError.apply(console, args);
    };

    // Test iframe creation to trigger X-Frame-Options check
    const testIframe = document.createElement('iframe');
    testIframe.src = window.location.origin + '/admin';
    testIframe.style.display = 'none';
    document.body.appendChild(testIframe);

    // Check response headers
    fetch(window.location.href)
      .then(response => {
        const headerObj: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headerObj[key] = value;
        });
        setHeaders(headerObj);
      })
      .catch(error => {
        console.error('Failed to fetch headers:', error);
      });

    // Cleanup
    return () => {
      console.error = originalError;
      if (testIframe.parentNode) {
        testIframe.parentNode.removeChild(testIframe);
      }
    };
  }, []);

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Headers Test</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Testing X-Frame-Options and other security headers configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Headers Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Security Headers Status
          </h2>
          
          <div className="space-y-3">
            {[
              'x-frame-options',
              'x-content-type-options',
              'x-xss-protection',
              'strict-transport-security',
              'content-security-policy',
              'referrer-policy'
            ].map(header => {
              const value = headers[header];
              const isPresent = !!value;
              
              return (
                <div key={header} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {header.toUpperCase()}
                    </span>
                    {value && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {value}
                      </p>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    isPresent 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {isPresent ? 'SET' : 'MISSING'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Console Errors Check */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Console Errors Check
          </h2>
          
          {consoleErrors.length === 0 ? (
            <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  No X-Frame-Options console errors detected!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Security headers are properly configured.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Console errors detected:
                  </p>
                </div>
              </div>
              {consoleErrors.map((error, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded border-l-4 border-red-400">
                  <code className="text-sm text-gray-800 dark:text-gray-200">
                    {error}
                  </code>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* X-Frame-Options Specific Test */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          X-Frame-Options Test Results
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
              Header Configuration
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              X-Frame-Options: {headers['x-frame-options'] || 'Not Set'}
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
              CSP frame-ancestors: {headers['content-security-policy']?.includes('frame-ancestors') ? 'Set' : 'Not Set'}
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h3 className="font-medium text-purple-900 dark:text-purple-200 mb-2">
              Implementation Method
            </h3>
            <p className="text-sm text-purple-800 dark:text-purple-300">
              ✅ HTTP Header (next.config.ts)
            </p>
            <p className="text-sm text-purple-800 dark:text-purple-300">
              ❌ Meta Tag (removed)
            </p>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-medium text-green-900 dark:text-green-200 mb-2">
              Protection Status
            </h3>
            <p className="text-sm text-green-800 dark:text-green-300">
              Iframe Protection: {headers['x-frame-options'] === 'DENY' ? 'Active' : 'Inactive'}
            </p>
            <p className="text-sm text-green-800 dark:text-green-300 mt-1">
              Console Warnings: {consoleErrors.length === 0 ? 'None' : `${consoleErrors.length} found`}
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h3 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">
          How to Test
        </h3>
        <ol className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1 list-decimal list-inside">
          <li>Open browser developer tools (F12)</li>
          <li>Check the Console tab for any X-Frame-Options warnings</li>
          <li>Check the Network tab and inspect response headers</li>
          <li>Verify that X-Frame-Options is set as an HTTP header, not a meta tag</li>
        </ol>
      </div>
    </div>
  );
}