'use client';

import { useAuth } from '@/components/AuthProvider';

export function useSession() {
  const { user, loading, isAuthenticated, logout, refetch } = useAuth();

  return {
    user,
    profile: user,
    loading,
    isAuthenticated,
    logout,
    refetch,
  };
}
