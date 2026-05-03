"use client";

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { loginUserApi } from '@/lib/api/auth';
import { loginSuccess } from '@/lib/redux/slices/authSlice';
import { mergeCarts, fetchCart } from '@/lib/redux/slices/cartSlice';
import { AppDispatch } from '@/lib/redux/store';
import { setClientAuthCookie } from '@/lib/auth/sessionCookie';

import { useCart } from "@/context/CartContext";
import { useWishlist as useLocalWishlist } from "@/context/WishlistContext";
import { mergeWishlist, fetchWishlist } from "@/lib/redux/slices/wishlistSlice";
import { Eye, EyeOff } from 'lucide-react'; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneError, setPhoneError] = useState(''); 
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { items: localCartItems, clearCart: clearLocalCart } = useCart();
  const { items: localWishlistItems, clearWishlist: clearLocalWishlist } = useLocalWishlist();


  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await loginUserApi({ email, password });
      const { user, accessToken } = response.data;
      
      // First dispatch login success
      dispatch(loginSuccess({ user, accessToken }));
      
      // Set a same-site client cookie for Next middleware route protection.
      setClientAuthCookie(accessToken);
      
      toast.success('Logged in successfully');
      
      // Handle cart merging
      if (localCartItems && localCartItems.length > 0) {
        toast.info("Syncing your cart...");
        const itemsToMerge = localCartItems.map(item => ({ 
          productId: item.productId,
          sku_variant: item.sku_variant || 'default',
          quantity: item.quantity 
        }));
        
        await dispatch(mergeCarts(itemsToMerge));
        await dispatch(fetchCart());
        clearLocalCart();
        toast.success("Cart synced successfully!");
      }

      // Handle wishlist merging
      if (localWishlistItems && localWishlistItems.length > 0) {
        toast.info("Syncing your wishlist...");
        const productIdsToMerge = localWishlistItems.map(item => item._id);
        
        await dispatch(mergeWishlist(productIdsToMerge));
        await dispatch(fetchWishlist());
        clearLocalWishlist();
        toast.success("Wishlist synced successfully!");
      }

      // console.log("----user----", user);
      // console.log("----user role----", user.role);
      
      // Add a small delay to ensure cookie is set
      setTimeout(() => {
        const redirectPath = new URLSearchParams(window.location.search).get('redirect');
        if (user.role === 'admin') {
          console.log("---------Redirecting to admin dashboard---------");
          // Use window.location for more reliable redirect on live server
          window.location.href = redirectPath?.startsWith('/account/admin') ? redirectPath : '/account/admin';
        } else {
          console.log("---------Redirecting to home---------");
          window.location.href =
            redirectPath && !redirectPath.startsWith('/account/admin')
              ? redirectPath
              : '/';
        }
      }, 500);

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An unknown error occurred.';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-xl border bg-white p-10 shadow-sm">
        <div>
          <h2 className="text-center text-3xl font-bold">Sign in to your account</h2>
           <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/signup" className="font-medium text-[#D09D13] hover:text-[#b48a10]">
              create a new account
            </Link>
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <Button type="submit" className="w-full bg-[var(--primary-button-theme)] hover:bg-[var(--secondary-button-theme)] text-white hover:text-[var(--secondary-button-text)]" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
