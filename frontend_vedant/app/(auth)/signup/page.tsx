// signup/page.tsx
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUserApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { toast } from 'sonner'; 
import { Eye, EyeOff } from 'lucide-react'; 


export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return; // Stop the submission if validation fails
    }

    setIsLoading(true);
    // setError(''); // <-- Iski ab zaroorat nahi hai

    try {
      await registerUserApi({ name: fullName, email,phone,password, role: "user" });

      // Success toast dikhayein
      toast.success("Account created successfully!", {
        description: "An OTP has been sent to your email for verification.",
      });

      // OTP page par redirect karein
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);

    } catch (err: any) {
      // Error ko toast mein dikhayein
        //  ("err.message")
        //  (err.message)
      toast.error(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-subtle">
      <div className="w-full max-w-md space-y-8 rounded-xl border bg-background-main p-10 shadow-sm">
        <div>
          <h2 className="text-center text-3xl font-bold text-text-main">Create an Account</h2>
          <p className="mt-2 text-center text-sm text-text-subtle">
            Already registered?{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary-hover">
              Sign in
            </Link>
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? 'text' : 'password'} // Dynamically set type
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="pr-10" // Add padding to prevent text from overlapping the icon
              />
              <button
                type="button" // Important: Prevents form submission
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full bg-[var(--primary-button-theme)] hover:bg-[var(--secondary-button-theme)] text-white hover:text-[var(--secondary-button-text)]" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}