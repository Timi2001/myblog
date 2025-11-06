import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define admin routes that don't require authentication
  const publicAdminRoutes = [
    '/admin',
    '/admin/setup', 
    '/admin/simple-login',
    '/admin/direct-login',
    '/admin/bypass',
    '/admin/simple-test',
    '/admin/debug'
  ];

  // Only protect admin routes that require authentication
  if (pathname.startsWith('/admin') && !publicAdminRoutes.includes(pathname)) {
    try {
      // Get the authorization token from cookies or headers
      const authToken = request.cookies.get('auth-token')?.value || 
                       request.headers.get('authorization')?.replace('Bearer ', '');

      if (!authToken) {
        // No token found, redirect to admin login
        return NextResponse.redirect(new URL('/admin', request.url));
      }

      // Verify the token with our API
      const verifyResponse = await fetch(new URL('/api/auth/verify', request.url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: authToken }),
      });

      if (!verifyResponse.ok) {
        // Token is invalid, redirect to admin login
        const response = NextResponse.redirect(new URL('/admin', request.url));
        response.cookies.delete('auth-token'); // Clear invalid token
        return response;
      }

      // Token is valid, allow access
      return NextResponse.next();
    } catch (error) {
      console.error('Middleware auth error:', error);
      // On error, redirect to admin login
      const response = NextResponse.redirect(new URL('/admin', request.url));
      response.cookies.delete('auth-token'); // Clear potentially corrupted token
      return response;
    }
  }

  // For all other routes, continue normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all admin routes except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/admin/:path*',
  ],
};