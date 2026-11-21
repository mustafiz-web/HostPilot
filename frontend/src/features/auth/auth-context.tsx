import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, TOKEN_STORAGE_KEY } from '@/lib/api-client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STUDENT';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  studentId?: string;
  studentCode?: string;
  department?: string;
  rollNumber?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token?: string | null;
  role: 'ADMIN' | 'STUDENT' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  // Clear any legacy insecure token from localStorage to guarantee secure cookie persistence
  useEffect(() => {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // Safe ignore
    }
  }, []);

  // Fetch current user via TanStack Query using persistent HttpOnly cookie
  const {
    data: currentUserData,
    isLoading: isCheckingUser,
    refetch,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<UserProfile>('/auth/me');
        if (res.success && res.data) {
          return res.data;
        }
        return null;
      } catch {
        // 401 or network error when guest or logged out
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const user = currentUserData || null;
  const isAuthenticated = !!user;
  const role = user?.role || null;

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await apiClient.post<{ user: UserProfile; token: string }>('/auth/login', {
        email,
        password,
      });
      return res.data;
    },
    onSuccess: (data) => {
      apiClient.setToken(data.token);
      queryClient.setQueryData(['auth', 'me'], data.user);
    },
  });

  const login = useCallback(
    async (email: string, password: string): Promise<UserProfile> => {
      const res = await loginMutation.mutateAsync({ email, password });
      return res.user;
    },
    [loginMutation]
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      apiClient.setToken(null);
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
    }
  }, [queryClient]);

  const value: AuthContextType = {
    user,
    token: apiClient.getToken(),
    role,
    isAuthenticated,
    isLoading: isCheckingUser,
    login,
    logout,
    refetchUser: refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
