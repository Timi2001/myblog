'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, getAuthToken } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const refreshToken = async () => {
    if (user) {
      try {
        const newToken = await getAuthToken();
        setToken(newToken);
        
        // Use the API route to set the cookie
        await fetch('/api/auth/set-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: newToken }),
        });

      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Much shorter timeout - 3 seconds
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth loading timeout - setting loading to false');
        setLoading(false);
      }
    }, 3000);

    // Simplified auth listener
    const unsubscribe = onAuthStateChange((user) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', user ? `User logged in: ${user.email}` : 'User logged out');
      setUser(user);
      setLoading(false);
      clearTimeout(loadingTimeout);
      
      if (user) {
        refreshToken().catch(console.error);
      } else {
        setToken(null);
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    });

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, []);

  // Refresh token every 50 minutes (Firebase tokens expire after 1 hour)
  useEffect(() => {
    if (user) {
      const interval = setInterval(refreshToken, 50 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, token, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}