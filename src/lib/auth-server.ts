import { verifyIdToken } from './firebase-admin';

// Server-side auth verification for API routes only
export async function verifyAdminAuth(request: Request): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'No authorization token provided' };
    }

    const token = authHeader.substring(7);

    if (!token) {
      return { success: false, error: 'Invalid token' };
    }

    const decoded = await verifyIdToken(token);
    return { success: true, user: decoded };
  } catch (error) {
    console.error('Error verifying admin auth:', error);
    return { success: false, error: 'Authentication verification failed' };
  }
}
