// verifyOtpForm.tsx
"use client";

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginSuccess } from '@/lib/redux/slices/authSlice';
import { verifyOtpApi } from '@/lib/api/auth'; // Ensure this path is correct
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function VerifyOtpForm() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  // Redirect if email is not in the URL params
  if (!email) {
    // It's better to redirect server-side or in a useEffect hook to avoid layout shifts,
    // but for simplicity, this works.
    router.push('/signup');
    return null; 
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await verifyOtpApi({ email, otp });
      const { user, accessToken } = response.data;
      
      // Dispatch user data to Redux store
      dispatch(loginSuccess({ user, accessToken }));

      // **NEW: Redirect based on user role**
      if (user.role === 'admin') {
        router.push('/account/admin'); // Redirect admins to their dashboard
      } else {
        router.push('/'); // Redirect regular users to the homepage
      }

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-xl border bg-white p-10 shadow-sm">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a 6-digit OTP to {email}.
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="otp">Enter OTP</Label>
            <Input id="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <Button type="submit" className="w-full bg-[var(--primary-button-theme)] hover:bg-[var(--secondary-button-theme)] text-[var(--primary-button-text)] hover:text-[var(--secondary-button-text)]" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify & Login'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}