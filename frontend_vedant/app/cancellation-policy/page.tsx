"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Ban,
  Clock,
  PackageCheck,
  Banknote,
  HelpCircle,
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

export default function CancellationPolicyPage() {
  const sections = [
    { id: "window", title: "Cancellation Window" },
    { id: "how-to-cancel", title: "How to Cancel" },
    { id: "after-dispatch", title: "After Dispatch" },
    { id: "refunds", title: "Refunds" },
    { id: "support", title: "Support" },
  ];

  return (
    <div className="min-h-screen bg-[var(--base-10)]">
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-[var(--pallete-500)] md:text-5xl font-serif">
            Cancellation Policy
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            When and how customers can cancel Vedant Gurukul Aroma Mart orders.
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
              <PolicySection id="window" icon={Clock} title="1. Cancellation Window">
                <p>
                  Orders can be cancelled before they are packed or dispatched. Once an order is shipped and tracking details are generated, cancellation may not be possible and the order will be handled under our return process where eligible.
                </p>
              </PolicySection>

              <PolicySection id="how-to-cancel" icon={Ban} title="2. How to Cancel an Order">
                <p>To request cancellation, contact us as soon as possible with your Order ID and registered phone/email.</p>
                <p><strong>Email:</strong> <a href={`mailto:${supportEmail}`} className="text-primary underline">{supportEmail}</a></p>
                <p><strong>Phone:</strong> {supportPhone}</p>
                <p>Cancellation is confirmed only after our team verifies that the order has not been dispatched.</p>
              </PolicySection>

              <PolicySection id="after-dispatch" icon={PackageCheck} title="3. Orders Already Dispatched">
                <p>
                  If the order has already been dispatched, please accept delivery and raise a return request if the product is eligible under our <a href="/return-policy" className="text-primary underline">Return Policy</a>. Refusing delivery without confirmation may lead to deduction of shipping or return charges where applicable.
                </p>
              </PolicySection>

              <PolicySection id="refunds" icon={Banknote} title="4. Refunds for Approved Cancellations">
                <ul>
                  <li><strong>Prepaid orders:</strong> Refunds are initiated to the original payment source and usually reflect within 5-7 business days after approval and payment partner processing.</li>
                  <li><strong>Cash on Delivery orders:</strong> No refund is due if no payment has been collected.</li>
                  <li>Refunds may be subject to bank, UPI, card issuer, or payment partner processing timelines.</li>
                </ul>
              </PolicySection>

              <PolicySection id="support" icon={HelpCircle} title="5. Cancellation Support">
                <p>
                  For any cancellation or payment query, contact us with your Order ID. We aim to acknowledge and resolve customer queries within 4 business days wherever possible.
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
