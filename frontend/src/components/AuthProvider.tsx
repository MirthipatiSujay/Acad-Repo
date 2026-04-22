"use client";

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    // Attempt to fetch the user profile on initial load using the persisted token
    fetchUser();
  }, [fetchUser]);

  return <>{children}</>;
}
