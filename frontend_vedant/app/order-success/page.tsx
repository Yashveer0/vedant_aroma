import { Suspense } from 'react';
import OrderSuccessClient from './OrderSuccessClient'; // Import the new client component
import { Loader2 } from 'lucide-react';
import Navbar  from '@/components/Navbar'; // Import Navbar and Footer for the fallback
import Footer  from '@/components/Footer';

// This is the loading UI that will be shown while the page waits for the client
// to provide the URL search parameters.
const LoadingFallback = () => (
    <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center h-[70vh]">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
        <Footer />
    </div>
);

// This is now a Server Component. Its only job is to set up the Suspense boundary.
export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrderSuccessClient />
    </Suspense>
  );
}