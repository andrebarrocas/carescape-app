import { useState, useEffect } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      // Simple check for auth-token cookie
      const hasCustomToken = document.cookie.includes('auth-token=');
      
      // Extract user email from cookie if it exists
      let email = null;
      if (hasCustomToken) {
        const cookieMatch = document.cookie.match(/auth-token=([^;]+)/);
        if (cookieMatch) {
          try {
            // Decode JWT token to get user email
            const token = cookieMatch[1];
            const payload = JSON.parse(atob(token.split('.')[1]));
            email = payload.email;
          } catch (error) {
            console.error('Error decoding token:', error);
          }
        }
      }
      
      setIsAuthenticated(hasCustomToken);
      setUserEmail(email);
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
    session: isAuthenticated && userEmail ? { user: { email: userEmail } } : null
  };
}
