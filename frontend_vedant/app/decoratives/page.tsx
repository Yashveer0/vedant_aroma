// src/app/decorative/page.tsx

import { Suspense } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DecorativePageClient from './DecorativePageClient';

// Server Component for the Decorative Items Page
export default function DecorativePage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<DecorativePageFallback />}>
        <DecorativePageClient />
      </Suspense>
      <Footer />
    </>
  );
}

// Fallback component to show while the client component is loading
const DecorativePageFallback = () => {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Placeholder */}
      <div className="bg-gray-100 rounded-2xl p-8 text-center mb-12 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mt-4"></div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Placeholder */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-28 p-6 rounded-xl border bg-white shadow-sm space-y-6">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
        {/* Grid Placeholder */}
        <div className="flex-1">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-80 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};