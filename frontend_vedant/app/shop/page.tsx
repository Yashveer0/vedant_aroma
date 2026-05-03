"use client"
import { Suspense } from 'react';
import ShopPageClient from './ShopPageClient';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// This is now a Server Component
export default function ShopPage() {
  return (
    // Wrap the client component in a Suspense boundary
    <Suspense fallback={<ShopPageFallback />}>
      <ShopPageClient />
    </Suspense>
  );
}

// A simple fallback component to show while the page is loading
const ShopPageFallback = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-100 rounded-2xl p-8 text-center mb-12 animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mt-4"></div>
        </div>
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Loading products...</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};