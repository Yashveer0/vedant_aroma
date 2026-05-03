"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  BookText, 
  UserCircle2, 
  Gem, 
  ShoppingCart, 
  Copyright, 
  ShieldAlert, 
  Landmark, 
  Mail 
} from "lucide-react";
import { ReactNode } from "react";

// Reusable component for each policy section (Themed)
const PolicySection = ({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  children: ReactNode;
}) => (
  <section id={id} className="mb-12 scroll-mt-24">
    <div className="flex items-center">
      <Icon className="h-8 w-8 flex-shrink-0 text-primary" /> {/* Using theme color */}
      <h2 className="ml-4 text-2xl font-semibold text-[var(--pallete-300)]">{title}</h2>
    </div>
    <hr className="my-4 border-gray-200" />
    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">{children}</div>
  </section>
);

export default function TermsAndConditionsPage() {
  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "user-account", title: "Your Account" },
    { id: "products-pricing", title: "Products & Pricing" },
    { id: "orders-payment", title: "Orders & Payment" },
    { id: "intellectual-property", title: "Intellectual Property" },
    { id: "liability", title: "Limitation of Liability" },
    { id: "governing-law", title: "Governing Law" },
    { id: "contact", title: "Contact Information" },
  ];

  return (
    // --- FIX: Using --base-10 for the background ---
    <div className="min-h-screen bg-[var(--base-10)]">
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
        
        {/* --- Header rewritten for vedant gurukul aroma brand --- */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-[var(--pallete-500)] md:text-5xl font-serif">
            Terms of Service
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            The guidelines for using the vedant gurukul aroma website and services.
          </p>
          {/* <p className="mt-2 text-sm text-gray-500">
            Last Updated: 16 September 2025
          </p> */}
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* --- Sticky navigation (themed) --- */}
          <aside className="lg:col-span-1 lg:sticky lg:top-24 h-fit">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800">Quick Navigation</h3>
              <ul className="mt-4 space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-gray-600 transition-colors hover:text-primary hover:underline"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* --- Main content area with updated policies --- */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm md:p-12">
              
              <PolicySection id="introduction" icon={BookText} title="1. Introduction">
                <p>
                  Welcome to vedant gurukul aroma! These Terms of Service ("Terms") govern your use of our website (http://www.vedantgurukul.com) and the purchase of our women's clothing and decorative home goods. By accessing our site and placing an order, you agree to be bound by these Terms and our <a href="/privacy-policy" className="text-primary underline">Privacy Policy</a>.
                </p>
              </PolicySection>

              <PolicySection id="user-account" icon={UserCircle2} title="2. Your Account">
                <p>
                  To enhance your shopping experience, you may create an account. You are responsible for safeguarding your password and for all activities that occur under your account. Please ensure your account information is accurate and notify us immediately of any unauthorized use.
                </p>
              </PolicySection>
              
              <PolicySection id="products-pricing" icon={Gem} title="3. Products & Pricing">
                <p>
                  We take great care to display our clothing and decor items as accurately as possible. However, please note that colors may vary slightly depending on your monitor settings.
                </p>
                <p>
                  All product descriptions and prices are subject to change at any time without notice. We reserve the right to modify or discontinue a product at our discretion.
                </p>
              </PolicySection>

              <PolicySection id="orders-payment" icon={ShoppingCart} title="4. Orders & Payment">
                <p>
                  We reserve the right to refuse or cancel any order for any reason, such as limitations on quantities available for purchase or inaccuracies in product or pricing information. By placing an order, you confirm that all information you provide is true, accurate, and complete.
                </p>
              </PolicySection>

              <PolicySection id="intellectual-property" icon={Copyright} title="5. Intellectual Property">
                <p>
                  All content on this website, including but not limited to text, graphics, logos, images, and designs, is the property of vedant gurukul aroma or its content suppliers and is protected by international copyright laws. Reproduction is strictly prohibited without our express written consent.
                </p>
              </PolicySection>

              <PolicySection id="liability" icon={ShieldAlert} title="6. Limitation of Liability">
                <p>
                  In no event shall vedant gurukul aroma, our directors, employees, or affiliates be liable for any direct, indirect, incidental, or consequential damages arising from your use of this website or from any products purchased from it.
                </p>
              </PolicySection>

              <PolicySection id="governing-law" icon={Landmark} title="7. Governing Law">
                <p>
                  These Terms of Service shall be governed by and construed in accordance with the laws of India. Any disputes will be subject to the exclusive jurisdiction of the courts in the state where our business is registered.
                </p>
              </PolicySection>

              <PolicySection id="contact" icon={Mail} title="8. Contact Information">
                <p>
                  Questions about these Terms of Service should be sent to us at <a href="mailto:legal@vedantgurukularoma.com" className="text-primary underline">legal@vedantgurukularoma.com</a>.
                </p>
              </PolicySection>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}