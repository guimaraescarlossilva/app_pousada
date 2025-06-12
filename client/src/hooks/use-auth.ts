import { useState, useEffect } from 'react';
import { authService, type User, type LoginCredentials, type AuthState } from '@/lib/auth';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Initialize auth state on mount
    const initAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setAuthState({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        });
      } catch (error) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const user = await authService.login(credentials);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Handle logout error if needed
    } finally {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  return {
    ...authState,
    login,
    logout,
  };
}
