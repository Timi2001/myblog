import admin from 'firebase-admin';

// Use a global to prevent re-initialization in dev or hot reload
const globalForAdmin = global as unknown as { _adminApp?: admin.app.App };

function getPrivateKey(): string | undefined {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) return undefined;
  // Support both raw multiline and \n-escaped formats
  return key.includes('BEGIN PRIVATE KEY') ? key.replace(/\\n/g, '\n') : key;
}

export function getAdminApp(): admin.app.App {
  if (!globalForAdmin._adminApp) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = getPrivateKey();

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Firebase Admin credentials (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)');
    }

    globalForAdmin._adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
  return globalForAdmin._adminApp!;
}

export async function verifyIdToken(token: string) {
  const app = getAdminApp();
  return app.auth().verifyIdToken(token);
}
