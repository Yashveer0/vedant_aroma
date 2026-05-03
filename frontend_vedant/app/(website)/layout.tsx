"use client"; // This layout is a client component because it uses the `usePathname` hook.

import type React from "react";
import { usePathname } from "next/navigation";

// Import the shared components for your main website
// import Header from "@/components/Header"; 
import Footer from "@/components/Footer"; // Assuming you have a Footer component
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // usePathname hook must be used in a Client Component.
  const pathname = usePathname();

  return (
    <>
      {/* The Header will appear on all pages within the (website) group */}
      {/* <Header /> */}

      {/* The 'children' prop will be the actual page content (e.g., your homepage) */}
      <main className="min-h-screen">
        {children}
      </main>

      {/* Conditionally render the WhatsApp button only on the homepage */}
      {pathname === "/" && <FloatingWhatsApp />}

      {/* The Footer will also appear on all pages within this group */}
      <Footer />
    </>
  );
}