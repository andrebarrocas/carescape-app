import { useState, useEffect } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Simple check for auth-token cookie
      const hasCustomToken = document.cookie.includes('auth-token=');
      console.log('Auth check:', { hasCustomToken, authenticated: hasCustomToken });
      setIsAuthenticated(hasCustomToken);
      setIsLoading(false);
    };

    // Check immediately
    checkAuth();
    
    // Check every 500ms to catch cookie changes immediately
    const interval = setInterval(checkAuth, 500);
    
    return () => clearInterval(interval);
  }, []);

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
    session: null
  };
}
