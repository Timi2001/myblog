// This module is intentionally left as a compatibility shim.
// It re-exports client-safe helpers only to avoid pulling server-only code into client bundles.

export {
  signInAdmin,
  signOutAdmin,
  onAuthStateChange,
  onTokenChange,
  getCurrentUser,
  isAuthenticated,
  getAuthToken,
  verifyAuthToken,
} from './auth-client';

// Do NOT export verifyAdminAuth here to avoid accidental client imports causing firebase-admin bundling.