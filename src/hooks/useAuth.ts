import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check if we have a custom auth-token cookie
        const hasCustomToken = document.cookie.includes('auth-token=');
        
        // User is authenticated if either NextAuth session exists or custom token exists
        const authenticated = !!(session?.user || hasCustomToken);
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [session, status]);

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

  return {
    isAuthenticated,
    isLoading,
    logout,
    session
  };
}
