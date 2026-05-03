"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FilePenLine, MailCheck, Search, CheckCircle, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// --- Redux & UI Imports ---
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import { createGrievance, NewGrievancePayload } from '@/lib/redux/slices/grievanceSlice';
import { toast } from 'sonner';

// Grievance Page Component
export default function GrievancePage() {
  const dispatch = useDispatch<AppDispatch>();
  
  // --- Selectors to get user data and submission status ---
  const { user } = useSelector((state: RootState) => state.user);
  const { status: grievanceStatus, error } = useSelector((state: RootState) => state.grievance);

  // --- State for the form ---
  const initialFormState: NewGrievancePayload = {
    fullName: '',
    email: '',
    phoneNumber: '',
    orderId: '',
    natureOfGrievance: 'Other', // Default value
    description: '',
  };
  const [formData, setFormData] = useState<NewGrievancePayload>(initialFormState);

  // --- Effect to pre-fill form if user is logged in ---
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  // --- Handlers for form interactions ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.fullName || !formData.email || !formData.description) {
      toast.error("Missing Information", {
        description: "Please fill out all required fields.",
      });
      return;
    }

    try {
      // Dispatch the action and wait for the result
      const result = await dispatch(createGrievance(formData)).unwrap();
      
      toast.success("Inquiry Submitted Successfully!", {
        description: `Your ticket ID is ${result.ticketId}. We will get back to you shortly.`,
      });

      // Reset the form, but keep user's name and email
      setFormData({
        ...initialFormState,
        fullName: user?.fullName || '',
        email: user?.email || '',
      });

    } catch (err: any) {
      toast.error("Submission Failed", {
        description: String(err),
      });
    }
  };

  const grievanceProcess = [
    {
      step: 'Step 1: Your Voice',
      title: 'Share Your Concern',
      description: 'Fill out the form below or email our Wellness Guide with all relevant details, including your order ID.',
      icon: <FilePenLine className="w-10 h-10 text-[var(--brand-blue)]" />,
    },
    {
      step: 'Step 2: Acknowledgement',
      title: 'Receive Confirmation',
      description: 'You will receive an automated acknowledgement with a unique ticket number for your reference within 48 hours.',
      icon: <MailCheck className="w-10 h-10 text-[var(--brand-orange)]" />,
    },
    {
      step: 'Step 3: Mindful Review',
      title: 'Internal Reflection',
      description: 'Our dedicated team will investigate your concern thoroughly, mindfully examining all the details provided.',
      icon: <Search className="w-10 h-10 text-[var(--brand-green)]" />,
    },
    {
      step: 'Step 4: Harmony',
      title: 'Fair & Timely Resolution',
      description: 'We will communicate our findings and the proposed resolution to you within 15 business days, always seeking balance.',
      icon: <CheckCircle className="w-10 h-10 text-green-600" />,
    },
  ];

  return (
    <main className="overflow-hidden bg-gray-50">
        <Navbar />
      {/* === Hero Section === */}
      <section className="relative h-[60vh] flex items-center justify-center text-white bg-[var(--brand-orange)]/40">
        <div className="absolute inset-0 z-0">
          <Image
            src="/ayurveda-wellness-hero.jpg" // A relaxing image related to Ayurveda, yoga, or nature
            alt="Symbol of balance and holistic wellness"
            fill
            priority
            className="object-cover opacity-20"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/70 to-brand-dark/50" />
        </div>
        
        <div
        //   variants={staggerContainer} // Uncomment if using framer-motion
        //   initial="hidden"
        //   animate="visible"
          className="relative z-10 text-center px-4"
        >
          <div>
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200 leading-tight">
              Wellness & Support Channel
            </h1>
          </div>
          <div>
            <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto font-light text-gray-200/90 leading-relaxed">
              Our commitment to a fair and transparent process for resolving your concerns on your wellness journey.
            </p>
          </div>
        </div>
      </section>

      {/* === Our Commitment Section === */}
      <section className="py-20 md:py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
            <div>
                <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">Our Commitment to You</h2>
                <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                    At Vedant Gurukul Aroma, your peace and satisfaction are paramount. We have established a mindful support channel to ensure your concerns are heard and addressed in a timely, fair, and effective manner. We are committed to upholding the highest standards of service, rooted in the wisdom of Ayurveda.
                </p>
            </div>
        </div>
      </section>

      {/* === Step-by-Step Process Section === */}
      <section className="py-20 md:py-24 bg-green-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">Our 4-Step Path to Harmony</h2>
            <p className="text-lg text-gray-600 mt-4">A clear and structured path to resolution.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {grievanceProcess.map((item, index) => (
              <div 
                key={index}
                className="text-center p-6"
              >
                <div className="flex items-center justify-center mx-auto h-20 w-20 rounded-full bg-blue-100/50 mb-6">
                  {item.icon}
                </div>
                <h3 className="font-bold text-lg text-brand-dark mb-2">{item.step}</h3>
                <h4 className="font-semibold text-xl text-brand-dark mb-3">{item.title}</h4>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === Wellness Guide & Form Section === */}
      <section className="py-20 md:py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-16">
            {/* Wellness Guide Details */}
            <div className="lg:col-span-2">
              <div>
                <h2 className="text-3xl font-bold text-brand-dark mb-6">Contact Our Wellness Guide</h2>
                <div className="p-8 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    For any unresolved issues or to formally lodge an inquiry, you can contact our designated Wellness Guide.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800">Name:</h4>
                      <p className="text-gray-600">Aacharya Dr. Manish
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Designation:</h4>
                      <p className="text-gray-600">Head of Wellness Relations</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Email:</h4>
                      <a href="mailto:vedantgurukul@gmail.com" className="text-[var(--brand-blue)] hover:underline">
                      vedantgurukul@gmail.com
                      </a>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Response Time:</h4>
                      <p className="text-gray-600">We will address your email within 72 business hours.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Inquiry Form */}
            <div className="lg:col-span-3">
              <div>
                <h2 className="text-3xl font-bold text-brand-dark mb-6">Submit Your Inquiry</h2>
                <form onSubmit={handleSubmit} className="space-y-6 p-8 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input type="text" id="fullName" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--brand-blue)] transition" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                      <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--brand-blue)] transition" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                      <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--brand-blue)] transition" />
                    </div>
                    <div>
                      <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                      <input type="text" id="orderId" name="orderId" value={formData.orderId} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--brand-blue)] transition" placeholder="e.g., VMAR12345" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="natureOfGrievance" className="block text-sm font-medium text-gray-700 mb-1">Nature of Inquiry *</label>
                    <select id="natureOfGrievance" name="natureOfGrievance" required value={formData.natureOfGrievance} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--brand-blue)] transition bg-white">
                      <option value="Order Inquiry">Order Inquiry</option>
                      <option value="Product/Oil Inquiry">Product/Oil Inquiry</option>
                      <option value="Shipping Inquiry">Shipping Inquiry</option>
                      <option value="Yoga Service Inquiry">Yoga Service Inquiry</option>
                      <option value="Payment Inquiry">Payment Inquiry</option>
                      <option value="Feedback/Suggestion">Feedback/Suggestion</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Detailed Description *</label>
                    <textarea id="description" name="description" required rows={5} value={formData.description} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[var(--brand-blue)] transition" placeholder="Please describe your concern in as much detail as possible..."></textarea>
                  </div>
                  <div>
                    <button type="submit" disabled={grievanceStatus === 'loading'} className="w-full flex items-center justify-center px-8 py-4 bg-[var(--brand-blue)] text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-300 shadow-lg disabled:bg-blue-300 disabled:cursor-not-allowed">
                      {grievanceStatus === 'loading' ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Inquiry'
                      )}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}