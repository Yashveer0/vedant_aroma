"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  CornerUpLeft,
  Search,
  PackageCheck,
} from "lucide-react";
import { ReactNode } from "react";

const supportEmail = "vedant.gurukul7@gmail.com";
const supportPhone = "+91 79917 49998, +91 82998 54442";

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
      <Icon className="h-8 w-8 flex-shrink-0 text-primary" />
      <h2 className="ml-4 text-2xl font-semibold text-[var(--pallete-300)]">{title}</h2>
    </div>
    <hr className="my-4 border-gray-200" />
    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">{children}</div>
  </section>
);

export default function ReturnPolicyPage() {
  const sections = [
    { id: "our-promise", title: "Our Commitment" },
    { id: "return-window", title: "Return Window" },
    { id: "eligibility", title: "Conditions" },
    { id: "non-returnable", title: "Non-Returnable" },
    { id: "initiate-return", title: "Start a Return" },
    { id: "inspection", title: "Inspection & Refund" },
  ];

  return (
    <div className="min-h-screen bg-[var(--base-10)]">
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-[var(--pallete-500)] md:text-5xl font-serif">
            Return Policy
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Conditions and steps for returning eligible aroma oil orders.
          </p>
          <p className="mt-2 text-sm text-gray-500">Last Updated: 15 May 2026</p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <aside className="lg:col-span-1 lg:sticky lg:top-24 h-fit">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800">Quick Navigation</h3>
              <ul className="mt-4 space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="text-gray-600 transition-colors hover:text-primary hover:underline">
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm md:p-12">
              <PolicySection id="our-promise" icon={PackageCheck} title="1. Our Commitment">
                <p>
                  We pack and ship aroma oils with care. If you receive a damaged, incorrect, or eligible unopened product, we will help with a return, replacement, or refund as per the terms below.
                </p>
              </PolicySection>

              <PolicySection id="return-window" icon={CalendarDays} title="2. Return Window">
                <p>
                  Return requests must be raised within <strong>7 days from the date of delivery</strong>. Requests raised after 7 days are not eligible for return unless required by applicable law.
                </p>
              </PolicySection>

              <PolicySection id="eligibility" icon={CheckCircle2} title="3. Conditions for a Valid Return">
                <p>For a return to be accepted, the product must meet all of the following conditions:</p>
                <ul>
                  <li>The product is unopened, unused, and in original sealed packaging.</li>
                  <li>All labels, tamper-evident seals, invoices, accessories, and original box/packing are intact.</li>
                  <li>The product is not damaged after delivery due to misuse, improper storage, or handling by the customer.</li>
                  <li>The return is approved by our support team after reviewing the request details.</li>
                </ul>
              </PolicySection>

              <PolicySection id="non-returnable" icon={XCircle} title="4. Non-Returnable Items & Cases">
                <ul>
                  <li>Opened, used, or partially consumed products.</li>
                  <li>Products with broken seals, missing labels, missing invoice, or damaged original packaging.</li>
                  <li>Items marked final sale, clearance, or gift cards where applicable.</li>
                  <li>Returns raised after the 7-day return window.</li>
                  <li>Damage or shortage reported after 48 hours of delivery.</li>
                </ul>
                <h4 className="font-semibold mt-4">Damaged, defective, or incorrect item</h4>
                <p>
                  If your order arrives damaged, defective, missing, or incorrect, contact us within <strong>48 hours of delivery</strong> with your Order ID and clear photos/video of the package and item.
                </p>
              </PolicySection>

              <PolicySection id="initiate-return" icon={CornerUpLeft} title="5. How to Start a Return">
                <p>Send your return request with Order ID, reason, photos/video where applicable, and contact details.</p>
                <p><strong>Email:</strong> <a href={`mailto:${supportEmail}`} className="text-primary underline">{supportEmail}</a></p>
                <p><strong>Phone:</strong> {supportPhone}</p>
                <p>Our team will review the request and share next steps. Reverse pickup is subject to courier serviceability. If reverse pickup is not available, we may ask you to ship the item to our return address.</p>
              </PolicySection>

              <PolicySection id="inspection" icon={Search} title="6. Inspection & Refund">
                <p>
                  Once the returned product reaches us, it will be inspected. If approved, replacement or refund will be processed as per our <a href="/refund-policy" className="text-primary underline">Refund Policy</a>. We may reject a return if the product does not meet the conditions above.
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
