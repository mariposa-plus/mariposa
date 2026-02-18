'use client';

import { useState, useEffect, useRef, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const { verifyOTP, sendOTP, isLoading, error, clearError } = useAuthStore();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    const otpCode = code.join('');
    if (otpCode.length !== 6) {
      return;
    }

    try {
      await verifyOTP(email, otpCode);
      router.push('/dashboard');
    } catch (err) {
      // Error is already set in store
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setResendMessage('');
    try {
      await sendOTP(email);
      setResendMessage('New code sent to your email!');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setResendMessage('Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="text-center">Verify Your Email</h1>
      <p className="text-center" style={{ marginBottom: '20px', color: '#666' }}>
        We sent a code to <strong>{email}</strong>
      </p>

      {error && <div className="error">{error}</div>}
      {resendMessage && <div className="success">{resendMessage}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              style={{
                width: '50px',
                height: '60px',
                textAlign: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                border: '1px solid #ccc',
                borderRadius: '8px',
              }}
              required
            />
          ))}
        </div>

        <button type="submit" className="btn" disabled={isLoading || code.join('').length !== 6}>
          {isLoading ? 'Verifying...' : 'Verify'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={handleResendOTP}
          disabled={resendLoading}
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          {resendLoading ? 'Sending...' : 'Resend Code'}
        </button>
      </div>

      <p className="text-center mt-20">
        <Link href="/login" className="link">
          Back to Login
        </Link>
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="auth-container">
        <p className="text-center">Loading...</p>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
