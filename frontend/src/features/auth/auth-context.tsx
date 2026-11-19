import React, { createContext, useContext, useState, useCallback } from 'react';
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
  token: string | null;
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
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  });

  // Fetch current user via TanStack Query
  const {
    data: currentUserData,
    isLoading: isFetchingUser,
    refetch,
  } = useQuery({
    queryKey: ['auth', 'me', token],
    queryFn: async () => {
      if (!token) return null;
      try {
        const res = await apiClient.get<UserProfile>('/auth/me');
        return res.data;
      } catch (err) {
        // If 401/invalid token, wipe it
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        return null;
      }
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
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
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      setToken(data.token);
      queryClient.setQueryData(['auth', 'me', data.token], data.user);
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
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setToken(null);
      queryClient.clear();
    }
  }, [queryClient]);

  const value: AuthContextType = {
    user,
    token,
    role,
    isAuthenticated,
    isLoading: !!token && isFetchingUser,
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
