"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Camera, UserCircle, Loader2 } from 'lucide-react';

import type { RootState, AppDispatch } from '@/lib/redux/store';
import { fetchUserProfile, updateUserProfile, updateUserAvatar } from '@/lib/redux/slices/userSlice';
import { updateUserProfile as updateAuthUser } from '@/lib/redux/slices/authSlice';

import Navbar  from '@/components/Navbar';
import  Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function EditProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { user, status: userStatus } = useSelector((state: RootState) => state.user);

  // --- UPDATED: Added state for phone number ---
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!user) {
      dispatch(fetchUserProfile());
    }
  }, [isAuthenticated, user, dispatch, router]);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      // --- UPDATED: Populate phone number state ---
      setPhone(user.phone || ''); // Use empty string as fallback
    }
  }, [user]);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setSuccessMessage(null); 
      setError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!fullName.trim()) {
      setError('Full name cannot be empty.');
      return;
    }
    
    // --- ADDED: Phone number validation ---
    if (phone&& !/^\d{10}$/.test(phone)) {
        setError('Please enter a valid 10-digit phone number.');
        return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const promises = [];
      const profileUpdatePayload: { fullName?: string; phone?: string } = {};

      // --- UPDATED: Check for changes in both fullName and phone ---
      if (fullName.trim() !== user.fullName) {
        profileUpdatePayload.fullName = fullName.trim();
      }
      if (phone.trim() !== (user.phone || '')) {
        profileUpdatePayload.phone = phone.trim();
      }
      
      if (Object.keys(profileUpdatePayload).length > 0) {
        promises.push(dispatch(updateUserProfile(profileUpdatePayload)).unwrap());
      }
      
      if (avatarFile) {
        promises.push(dispatch(updateUserAvatar(avatarFile)).unwrap());
      }
      
      if (promises.length === 0) {
        setSuccessMessage("No changes detected.");
        setIsSaving(false);
        return;
      }

      const results = await Promise.all(promises);
      const updatedUserPayload = results.find(result => result && result.fullName);
      
      if (updatedUserPayload) {
        dispatch(updateAuthUser(updatedUserPayload));
      }

      setSuccessMessage('Profile updated successfully!');
      setAvatarFile(null);

    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (userStatus === 'loading' || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="mb-1 text-3xl font-bold font-serif text-gray-900">Edit Profile</h1>
          <p className="mb-8 text-gray-500">Update your personal details and avatar.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* --- Avatar Update Section --- */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-gray-200">
                  {avatarPreview || user.avatar ? (
                    <Image
                      src={avatarPreview || user.avatar!}
                      alt="Avatar Preview"
                      width={112}
                      height={112}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserCircle className="h-full w-full text-gray-300" strokeWidth={1} />
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-800 text-white transition-colors hover:bg-gray-700"
                >
                  <Camera size={16} />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
            </div>

            {/* --- Personal Details Section --- */}
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="h-11 bg-gray-100"
                />
              </div>
            </div>
            
            {/* --- Feedback Messages --- */}
            {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex items-center justify-end space-x-4 border-t border-gray-200 pt-6">
              <Link href="/account/user">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSaving} className="w-32 bg-[#D09D13] hover:bg-[#b48a10]">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}