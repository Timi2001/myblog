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
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
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
  const user = getCurrentUser();
  if (!user) return null;
  return getIdToken(user, true);
}

export async function verifyAuthToken(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}
