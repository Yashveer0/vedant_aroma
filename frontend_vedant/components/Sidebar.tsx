"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Gem,
  MessageSquare,
  TicketPercent,
  X, // Import the close icon
  LogOut,
  Percent,
  MessageSquareDiff,
  ChartBarStacked,
  ChartBarIncreasing,
  BookImage,
  MailWarning,
  UserRoundCheck,
  Clapperboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutUserApi } from "@/lib/api/auth";
import { logout } from "@/lib/redux/slices/authSlice";
import { clearClientAuthCookies } from "@/lib/auth/sessionCookie";
import { useDispatch } from "react-redux";

const navLinks = [
    { href: "/account/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/account/admin/users", label: "Manage Users", icon: Users },
    { href: "/account/admin/products", label: "Manage Products", icon: Gem },
    { href: "/account/admin/services", label: "Manage Services", icon: Gem },
    
    { href: "/account/admin/orders", label: "Manage Orders", icon: Package },
    // { href: "/account/admin/bulk-orders", label: "Manage Bulk Orders", icon: MessageSquareDiff },
    // new
    { href: "/account/admin/category", label: "Manage Category", icon: ChartBarStacked },
    { href: "/account/admin/sub-category", label: "Manage Subcategory", icon: ChartBarIncreasing },
    { href: "/account/admin/blogs", label: "Manage Blogs", icon: BookImage },
    { href: "/account/admin/grievances", label: "Support Management", icon: MailWarning },


    { href: "/account/admin/contacts", label: "Manage Contacts", icon: MessageSquare },
    { href: "/account/admin/coupon", label: "Manage Coupon", icon: TicketPercent },

    { href: "/account/admin/testimonials", label: "Manage Testimonials", icon: UserRoundCheck },
    { href: "/account/admin/reels", label: "Manage Reels", icon: Clapperboard },

    { href: "/account/admin/setting", label: "Settings", icon: Percent },
    { href: "/logout", label: "Logout", icon: LogOut },
];

// Define props to control the sidebar's state from the parent layout
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const dispatch = useDispatch()
  const router = useRouter();
  const pathname = usePathname();

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

    <aside
      className={`fixed top-0 left-0 z-40 h-full w-72 bg-white shadow-md transition-transform duration-300 ease-in-out 
      ${isOpen ? "translate-x-0" : "-translate-x-full overflow-auto"}
      lg:translate-x-0`}
    >
      <div className="flex items-center justify-between p-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
        {/* Close button for mobile, hidden on large screens */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
      <nav className="flex flex-col p-4 overflow-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;

          if (link.href === "/logout") {
            return (
              <button
                key={link.label}
                onClick={() => {
                  handleLogout();
                  onClose(); // Close sidebar on link click in mobile view
                }}
                className={`flex items-center rounded-md px-4 py-3 text-gray-700 transition-colors hover:bg-gray-200 text-left`}
              >
                <link.icon className="mr-3 h-5 w-5" />
                {link.label}
              </button>
            );
          }

          return (
            <Link
              key={link.label}
              href={link.href}
              className={`flex items-center rounded-md px-4 py-3 text-gray-700 transition-colors hover:bg-gray-200 ${
                isActive ? "bg-gray-300 font-semibold" : ""
              }`}
              onClick={onClose} // Close sidebar on link click in mobile view
            >
              <link.icon className="mr-3 h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
