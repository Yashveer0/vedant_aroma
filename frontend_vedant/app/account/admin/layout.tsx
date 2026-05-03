"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import HeaderDashboard from "@/components/HeaderDashboard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="flex flex-1 flex-col lg:ml-64 "> {/* Margin is now responsive */}
        <HeaderDashboard
          title="Dashboard" 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6 md:p-8 ml-4">
          {children}
        </main>
      </div>

      {/* Optional: Adds a dark overlay behind the sidebar on mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}