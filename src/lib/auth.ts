import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  getIdToken,
  onIdTokenChanged
} from 'firebase/auth';
import { auth } from './firebase';

export async function signInAdmin(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

export async function signOutAdmin(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function onTokenChange(callback: (user: User | null) => void) {
  return onIdTokenChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export function isAuthenticated(): boolean {
  return !!auth.currentUser;
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const user = getCurrentUser();
    if (!user) return null;
    
    const token = await getIdToken(user, true); // Force refresh
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

export async function verifyAuthToken(): Promise<boolean> {
  try {
    const token = await getAuthToken();
    return !!token;
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return false;
  }
}

// Server-side auth verification for API routes
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

    // Properly verify the Firebase ID token using Admin SDK
    const { verifyIdToken } = await import('./firebase-admin');
    const decoded = await verifyIdToken(token);

    return { success: true, user: decoded };
  } catch (error) {
    console.error('Error verifying admin auth:', error);
    return { success: false, error: 'Authentication verification failed' };
  }
}