"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  CalendarDays, 
  CheckCircle2, 
  XCircle, 
  CornerUpLeft, 
  Search,
  PackageCheck 
} from "lucide-react";
import { ReactNode } from "react";

// Reusable component for each policy section (Themed)
const PolicySection = ({
  id,
  icon: Icon,
  title,
  children,
}: {
  id:string;
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
    { id: "eligibility", title: "Conditions for Return" },
    { id: "non-returnable", title: "Exemptions & Special Cases" },
    { id: "initiate-return", title: "How to Start a Return" },
    { id: "inspection", title: "Inspection & Refund" },
  ];

  return (
    <div className="min-h-screen bg-[var(--base-10)]">
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
        
        {/* --- Header rewritten for Vedant Gurukul Aroma brand --- */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-[var(--pallete-500)] md:text-5xl font-serif">
            Return & Exchange Policy
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Your trust in our purity and authenticity is paramount.
          </p>
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

          {/* --- Main content area with updated policies for Vedant Gurukul --- */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm md:p-12">

              <PolicySection id="our-promise" icon={PackageCheck} title="1. Our Commitment to You">
                <p>At Vedant Gurukul, your satisfaction and holistic well-being are our top priorities. We stand behind the authenticity and quality of our aroma oils and wellness products. If you are not completely satisfied with your purchase, we are here to help, subject to the terms below.</p>
              </PolicySection>
              
              <PolicySection id="return-window" icon={CalendarDays} title="2. Return Window">
                <p>To ensure the purity and integrity of our products, we offer a <strong>7-day return policy</strong>. Please initiate your return request within 7 days from the date of delivery. Any requests made after this period will not be eligible for a return.</p>
              </PolicySection>

              <PolicySection id="eligibility" icon={CheckCircle2} title="3. Conditions for a Valid Return">
                <p>For a return to be accepted, the product must be in its original condition. This means:</p>
                <ul>
                  <li>The item must be <strong>unopened, unused, and in its original sealed packaging.</strong></li>
                  <li>The product’s seal and any tamper-evident labels must be fully intact.</li>
                  <li>It must be returned with all original boxing, manuals, and accessories.</li>
                </ul>
              </PolicySection>

              <PolicySection id="non-returnable" icon={XCircle} title="4. Exemptions & Special Cases">
                <p>Due to the nature of our products and services, the following are non-returnable:</p>
                <ul>
                  <li>Any product that has been opened, used, or has a broken seal.</li>
                  <li><strong>Services:</strong> All Astrology, Vastu, Healing, or other consultation services are non-refundable once they have been rendered.</li>
                  <li>Products marked as "Final Sale" or purchased from a clearance section.</li>
                  <li>Gift cards.</li>
                </ul>
                <h4 className="font-semibold mt-4">What if my item is damaged or incorrect?</h4>
                <p>If you receive a damaged, defective, or incorrect item, please contact our support team within <strong>48 hours</strong> of delivery with a photo of the product. We will gladly arrange for a replacement or a full refund at no cost to you.</p>
              </PolicySection>
              
              <PolicySection id="initiate-return" icon={CornerUpLeft} title="5. How to Start a Return">
                <p>To begin the return process, please email our customer care team at <a href="mailto:support@vedantgurukul.com" className="text-primary underline">support@vedantgurukul.com</a>. Be sure to include your <strong>Order ID</strong> and the reason for the return. Our team will guide you through the next steps and arrange for a reverse pickup where possible.</p>
              </PolicySection>

              <PolicySection id="inspection" icon={Search} title="6. Inspection & Refund">
                <p>Once your returned item reaches our facility, it will undergo a quality inspection. If the return is approved, we will notify you and process your refund as per our <a href="/refund-policy" className="text-primary underline">Refund Policy</a>. Vedant Gurukul reserves the right to reject any return that does not meet the above conditions.</p>
              </PolicySection>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}