'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { sendOTP, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await sendOTP(email);
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      // Error is already set in store
    }
  };

  return (
    <div className="auth-container">
      <h1 className="text-center">Pipeline Builder</h1>
      <p className="text-center" style={{ marginBottom: '30px', color: '#666' }}>
        Enter your email to receive a login code
      </p>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError();
            }}
            required
          />
        </div>

        <button type="submit" className="btn" disabled={isLoading}>
          {isLoading ? 'Sending code...' : 'Send Login Code'}
        </button>
      </form>
    </div>
  );
}
