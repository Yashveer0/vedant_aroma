"use client";

import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { logout } from '@/lib/redux/slices/authSlice';
import { useRouter } from 'next/navigation';

import { logoutUserApi } from '@/lib/api/auth';
import { clearClientAuthCookies } from '@/lib/auth/sessionCookie';

import { useDispatch,useSelector } from "react-redux";

export default function HeaderDashboard({ title, onMenuClick }: { title: string; onMenuClick?: () => void }) {
  const dispatch = useDispatch()
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUserApi(); // 1. Call API to clear server session/cookie
    } catch (error) {
      console.error("Failed to logout from server, but proceeding with client-side cleanup.");
    } finally {
      clearClientAuthCookies();
      dispatch(logout()); // 2. Clear Redux state and localStorage
      router.push('/'); // 3. Redirect to the login page
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm ml-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-8 w-8" />
        </Button>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      </div>
      {/* <Link
        href="/logout"
        className="flex items-center gap-2 rounded-lg px-4 py-2 text-slate-600 transition-colors duration-200 hover:bg-red-100 hover:text-red-600"
      > */}
        <Button className="flex items-center gap-2 rounded-lg px-4 py-2" variant="destructive" onClick={handleLogout} >Logout</Button>
        {/* <span className="hidden sm:inline">Logout</span> */}
      {/* </Link> */}
    </header>
  );
}
