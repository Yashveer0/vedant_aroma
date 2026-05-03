// app/account/user/page.tsx (Full Code)

"use client";

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { RootState, AppDispatch } from '@/lib/redux/store';

// This is the most important import for this logic
import { selectIsAuthenticated } from '@/lib/redux/slices/authSlice'; 

import { fetchUserProfile } from '@/lib/redux/slices/userSlice';
import {
  UserCircle,
  Package,
  Heart,
  ShoppingCart,
  MapPin,
  ChevronRight,
  Gift,
  Loader2 // For loading state
} from 'lucide-react';
import Navbar  from '@/components/Navbar';
import Footer  from '@/components/Footer';
import { Button } from '@/components/ui/button'; // Import Button for error state

// A reusable link component for the profile page
const ProfileLink = ({ href, icon: Icon, title, subtitle }: { href: string, icon: React.ElementType, title: string, subtitle: string }) => (
  <Link href={href} className="block">
    <div className="flex items-center p-6 transition-colors duration-200 hover:bg-gray-50">
      <div className="mr-5 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-600">
        <Icon size={24} />
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <ChevronRight size={20} className="text-gray-400" />
    </div>
  </Link>
);

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Get authentication status directly from authSlice
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  // Get user profile data from userSlice
  const { user, status: userStatus, error } = useSelector((state: RootState) => state.user);

  // This effect handles both redirection and data fetching
  useEffect(() => {
    if (isAuthenticated) {
      // If authenticated, fetch profile data
      console.log(isAuthenticated)
      dispatch(fetchUserProfile());
    } else {
      // If not authenticated, redirect to login page
      // router.push('/login');
    }
  }, [isAuthenticated, dispatch, router]);

  // --- RENDER STATES ---

  // While checking auth and fetching data, show a loader
  if (userStatus === 'loading' || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <p className="text-lg text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Handle fetch error from userSlice
  if (userStatus === 'failed') {
      return (
          <div className="flex min-h-screen items-center justify-center text-center bg-gray-50">
              <div>
                  <h2 className="text-xl font-bold text-red-600 mb-2">Failed to Load Profile</h2>
                  <p className="text-gray-500 mb-4">{error || 'An unexpected error occurred.'}</p>
                  <Button onClick={() => router.push('/')}>Go to Homepage</Button>
              </div>
          </div>
      );
  }

  // This should ideally not happen if the logic is correct, but it's a good safeguard.
  if (!user) {
    return null; // Prevents a flicker while redirecting.
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* User Info Section */}
          <div className="flex items-center p-6">
            <div className="flex-grow">
              <h1 className="text-3xl font-bold font-serif text-gray-900">{user.fullName}</h1>
              <p className="mt-1 text-gray-600">{user.email}</p>
              
              {user.wallet !== undefined && (
                <div className="mt-3 flex items-center gap-2">
                  <Gift size={20} className="text-primary" />
                  <span className="text-sm font-medium text-gray-700">
                    Redeem Points: <span className="text-primary font-bold">{user.wallet.toLocaleString()}</span>
                  </span>
                </div>
              )}
            </div>
            <div className="ml-6 flex flex-col items-center text-center">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt="User Avatar"
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <UserCircle size={64} className="text-gray-300" strokeWidth={1} />
              )}
              <Link href="/account/user/edit-profile" className="mt-2 block">
                <span className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
                  Edit Profile
                </span>
              </Link>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Navigation Links */}
          <div className="divide-y divide-gray-200">
            <ProfileLink
              href="/account/user/order-history"
              icon={Package}
              title="My Orders"
              subtitle="Track, cancel, or return your orders"
            />
            <ProfileLink
              href="/wishlist"
              icon={Heart}
              title="My Wishlist"
              subtitle="Your collection of favorite products"
            />
            <ProfileLink
              href="/cart"
              icon={ShoppingCart}
              title="My Cart"
              subtitle="View and manage items in your cart"
            />
            <ProfileLink
              href="/account/user/addresses"
              icon={MapPin}
              title="My Addresses"
              subtitle="Manage your shipping and billing addresses"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}