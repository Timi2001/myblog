import { NextResponse } from 'next/server';
import { getAdminApp } from '@/lib/firebase-admin';

export async function GET() {
  const result: any = {
    status: 'unknown',
    env: {
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
    },
    checks: {},
  };

  try {
    const app = getAdminApp();
    const auth = app.auth();
    result.checks.adminInitialized = true;

    // Try a lightweight call: listUsers(1) ensures credentials are valid
    await auth.listUsers(1);
    result.checks.authListUsers = 'ok';

    // Firestore ping
    const db = app.firestore();
    await db.collection('__diagnostics').limit(1).get();
    result.checks.firestore = 'ok';

    result.status = 'healthy';
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    result.status = 'unhealthy';
    result.error = { message: err?.message, code: err?.code, name: err?.name };
    return NextResponse.json(result, { status: 500 });
  }
}
