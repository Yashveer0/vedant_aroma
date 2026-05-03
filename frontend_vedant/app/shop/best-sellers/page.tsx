import { Suspense } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BestSellersPageClient from './BestSellersPageClient'; // Naye component ko import karein

// Yeh ek Server Component hai
export default function BestSellersPage() {
  return (
    <div className="bg-white">
      <Navbar />
      <Suspense fallback={<BestSellersPageFallback />}>
        <BestSellersPageClient />
      </Suspense>
      <Footer />
    </div>
  );
}

// Fallback component jo loading ke time dikhega
const BestSellersPageFallback = () => {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Placeholder */}
      <div className="relative h-[200px] md:h-[300px] w-full bg-gray-200 animate-pulse mb-8"></div>
      {/* Toolbar Placeholder */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-9 bg-gray-200 rounded w-[160px]"></div>
      </div>
      {/* Grid Placeholder */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
        {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl aspect-[3/4]"></div>
                <div className="mt-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2 mt-2"></div>
                </div>
            </div>
        ))}
      </div>
    </main>
  );
};