import { cookies } from 'next/headers';
import { admin } from '@/lib/firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';

export async function verifyAuth(): Promise<DecodedIdToken | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return null;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return null;
  }
}
