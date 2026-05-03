import { Suspense } from 'react';
import VerifyOtpForm from './VerifyOtpForm'; // We will move your logic into this component

// A simple loading fallback UI. You can make this a fancy spinner or skeleton component.
function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p>Loading...</p>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    // The Suspense boundary "catches" the need for client-side data from its children
    <Suspense fallback={<LoadingFallback />}>
      <VerifyOtpForm />
    </Suspense>
  );
}