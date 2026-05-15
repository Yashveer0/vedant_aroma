"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  RefreshCw,
  Banknote,
  Percent,
  HelpCircle,
  PackageCheck,
  XCircle,
  Mail,
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

export default function RefundPolicyPage() {
  const sections = [
    { id: "eligibility", title: "Eligibility" },
    { id: "exceptions", title: "Non-Refundable Cases" },
    { id: "processing", title: "Refund Processing" },
    { id: "timelines-method", title: "Timelines & Method" },
    { id: "deductions", title: "Deductions" },
    { id: "support", title: "Support" },
  ];

  return (
    <div className="min-h-screen bg-[var(--base-10)]">
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-[var(--pallete-500)] md:text-5xl font-serif">
            Refund Policy
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Clear refund rules, timelines, and payment method information for Vedant Gurukul Aroma Mart orders.
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
              <PolicySection id="eligibility" icon={PackageCheck} title="1. Eligibility for Refund">
                <p>A refund is processed when one of the following applies:</p>
                <ul>
                  <li>A prepaid order is cancelled before dispatch as per our <a href="/cancellation-policy" className="text-primary underline">Cancellation Policy</a>.</li>
                  <li>A return is approved after the item is received and quality checked as per our <a href="/return-policy" className="text-primary underline">Return Policy</a>.</li>
                  <li>The item delivered is damaged, defective, missing, or incorrect and the issue is reported within the stated timeline.</li>
                  <li>We are unable to fulfil an order due to stock, serviceability, or operational reasons.</li>
                </ul>
              </PolicySection>

              <PolicySection id="exceptions" icon={XCircle} title="2. Non-Refundable Cases">
                <p>Refunds may be declined in the following cases:</p>
                <ul>
                  <li>The product has been opened, used, damaged, altered, or returned without original sealed packaging.</li>
                  <li>The return request is raised after 7 days from delivery.</li>
                  <li>The customer provides an incorrect or incomplete delivery address and the shipment cannot be delivered.</li>
                  <li>Damage is reported after 48 hours of delivery or without clear photos/video of the issue.</li>
                  <li>Items marked as final sale, clearance, or gift cards where applicable.</li>
                </ul>
              </PolicySection>

              <PolicySection id="processing" icon={RefreshCw} title="3. Refund Processing">
                <p>
                  Once a cancellation or return is approved, we initiate the refund through the original payment method wherever supported. For prepaid orders, the refund is processed through Razorpay/payment partner records linked to the original order.
                </p>
                <p>
                  If additional bank details are required for a valid refund, our support team will contact you using your registered email or phone number.
                </p>
              </PolicySection>

              <PolicySection id="timelines-method" icon={Banknote} title="4. Refund Timelines & Method">
                <ul>
                  <li><strong>Prepaid orders:</strong> Refunds are credited to the original payment source within 5-7 business days after approval and payment partner processing.</li>
                  <li><strong>Cash on Delivery orders:</strong> Eligible refunds are processed by bank transfer within 7-10 business days after receiving correct bank details.</li>
                  <li><strong>Failed or duplicate payments:</strong> If confirmed by our payment partner, refunds are initiated to the original payment source.</li>
                </ul>
                <p>Actual credit time may vary depending on the bank, card issuer, UPI provider, or payment partner.</p>
              </PolicySection>

              <PolicySection id="deductions" icon={Percent} title="5. Possible Deductions">
                <p>The final refund amount may exclude or deduct the following where applicable:</p>
                <ul>
                  <li>Original shipping charges, COD charges, or convenience charges.</li>
                  <li>Reverse pickup or return shipping charges where the return is not due to our error.</li>
                  <li>Discounts, coupon benefits, reward points, or promotional credits used on the order.</li>
                </ul>
              </PolicySection>

              <PolicySection id="support" icon={HelpCircle} title="6. Refund Support">
                <p>If your approved refund is not received within the stated timeline, please contact us with your Order ID and payment reference.</p>
                <p><strong>Email:</strong> <a href={`mailto:${supportEmail}`} className="text-primary underline">{supportEmail}</a></p>
                <p><strong>Phone:</strong> {supportPhone}</p>
              </PolicySection>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
