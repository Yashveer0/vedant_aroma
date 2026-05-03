"use client" // This is crucial - it marks the component as a Client Component

import React, { useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, Package, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Navbar  from "@/components/Navbar"
import Footer  from "@/components/Footer"
import { motion } from "framer-motion"
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/redux/store';
import { clearLocalCartState } from '@/lib/redux/slices/cartSlice';
import { useToast } from "@/hooks/use-toast"; // <-- IMPORT useToast

export default function OrderSuccessClient() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast(); // <-- GET THE TOAST FUNCTION

  const orderId = searchParams.get('orderId');
  const serviceOrdered = searchParams.get('service_ordered'); // <-- GET THE NEW PARAMETER

  // This useEffect clears the cart state, which is correct.
  useEffect(() => {
    dispatch(clearLocalCartState());
  }, [dispatch]);

  // This useEffect handles the redirect if orderId is missing.
  useEffect(() => {
    if (!orderId) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [orderId, router]);
  
  // --- NEW useEffect TO SHOW THE SERVICE TOAST ---
  useEffect(() => {
    // Check if the orderId is present AND if our new parameter is 'true'
    if (orderId && serviceOrdered === 'true') {
      // Use a timeout to let the page render first, making the toast feel less abrupt.
      const timer = setTimeout(() => {
        toast({
          title: "Service Order Received!",
          description: "We have received your service request. We will review your details and contact you shortly.",
          duration: 8000, // Give the user a bit more time to read it
        });
      }, 500); // Show toast half a second after the page loads

      return () => clearTimeout(timer);
    }
    // Dependencies: run this effect if any of these values change.
  }, [orderId, serviceOrdered, toast]);


  // Render a message if the orderId is missing
  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex flex-col items-center justify-center text-center h-[60vh]">
            <h1 className="text-2xl font-serif font-bold mb-4">Invalid Page Access</h1>
            <p className="text-gray-600">You will be redirected to the homepage shortly.</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Render the main success message if the orderId exists
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-lg mx-auto bg-white p-8 sm:p-12 rounded-2xl border border-gray-200 shadow-sm text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="mx-auto h-20 w-20 mb-6 rounded-full bg-green-100 flex items-center justify-center"
          >
            <CheckCircle className="h-12 w-12 text-green-500" />
          </motion.div>

          <h1 className="text-3xl font-serif font-bold text-gray-800 mb-4">
            Thank You For Your Order!
          </h1>
          <p className="text-gray-600 mb-6">
            Your order has been placed successfully. You will receive an email confirmation shortly with all the details.
          </p>
          
          <div className="bg-gray-50 border border-dashed rounded-xl px-4 py-3 mb-8">
            <span className="text-gray-500 text-sm">Your Order ID</span>
            <p className="font-mono font-semibold text-lg text-gray-700 tracking-wider">
              {orderId}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/account/user/order-history" passHref>
              <Button variant="outline" className="w-full sm:w-auto">
                <Package className="mr-2 h-4 w-4" />
                View My Orders
              </Button>
            </Link>
            <Link href="/" passHref>
              <Button className="w-full sm:w-auto bg-[#A77C38] hover:bg-[#966b2a]">
                <Home className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}