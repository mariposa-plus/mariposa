'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // This app uses OTP-based authentication
    // Users are automatically registered when they verify their email
    router.push('/login');
  }, [router]);

  return (
    <div className="auth-container">
      <p className="text-center">Redirecting to login...</p>
    </div>
  );
}
