'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({
  children,
  adminOnly = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, hasHydrated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const isAdmin = user?.role === 'admin';

  // Mark as client-side mounted
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only redirect after hydration is complete and we're on the client
    if (!isClient || !hasHydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
    } else if (adminOnly && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, adminOnly, router, hasHydrated, isClient]);

  // Show loading state while hydrating
  if (!isClient || !hasHydrated) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0f1419',
        color: '#fff'
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  // After hydration, check auth status
  if (!isAuthenticated || (adminOnly && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}
