import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      // Check if we have a custom auth-token cookie
      const hasCustomToken = document.cookie.includes('auth-token=');
      
      // User is authenticated if either NextAuth session exists or custom token exists
      const authenticated = !!(session?.user || hasCustomToken);
      console.log('Auth check:', { 
        hasSession: !!session?.user, 
        hasCustomToken, 
        authenticated 
      });
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    // Check auth immediately
    checkAuth();
    
    // Listen for storage events (cookies changes)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    // Listen for focus events (user comes back to tab)
    const handleFocus = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkAuth]);

  const logout = async () => {
    try {
      // Call logout API to clear cookies
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Redirect to signin page after logout
      window.location.href = '/auth/signin';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback redirect even if logout fails
      window.location.href = '/auth/signin';
    }
  };

  const refreshAuth = useCallback(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isAuthenticated,
    isLoading,
    logout,
    refreshAuth,
    session
  };
}
