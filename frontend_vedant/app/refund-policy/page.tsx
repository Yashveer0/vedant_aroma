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
    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
        {children}
    </div>
  </section>
);

export default function RefundPolicyPage() {
  const sections = [
    { id: "eligibility", title: "Eligibility for Refund" },
    { id: "exceptions", title: "Non-Refundable Items & Services" },
    { id: "processing", title: "Refund Processing" },
    { id: "timelines-method", title: "Refund Timelines & Method" },
    { id: "deductions", title: "Possible Deductions" },
    { id: "support", title: "Contact for Support" },
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
            A clear and transparent process, built on our commitment to your satisfaction.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
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

          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm md:p-12">
              
              <PolicySection id="eligibility" icon={PackageCheck} title="1. Eligibility for a Refund">
                <p>A refund is processed only after a returned item has been received and approved by our quality check team. To be eligible, your item must meet all the criteria mentioned in our <a href="/return-policy" className="text-primary underline">Return Policy</a>, which primarily includes:</p>
                <ul>
                  <li>The item must be initiated for return within <strong>7 days</strong> of delivery.</li>
                  <li>The product must be <strong>unopened, unused, and in its original sealed packaging</strong> with all labels intact.</li>
                </ul>
              </PolicySection>
              
              <PolicySection id="exceptions" icon={XCircle} title="2. Non-Refundable Items & Services">
                <p>Please note that a refund cannot be issued for the following:</p>
                <ul>
                  <li>Any product that has been opened, used, or has its seal broken.</li>
                  <li><strong>Services:</strong> All Astrology, Vastu, Healing, or other consultation services are non-refundable once the service has been rendered.</li>
                  <li>Items marked as "Final Sale" or purchased from a clearance section.</li>
                  <li>Gift cards.</li>
                </ul>
              </PolicySection>

              <PolicySection id="processing" icon={RefreshCw} title="3. Refund Processing">
                <p>Once your return is received at our facility, our team will inspect it to ensure it meets our return conditions. We will send you an email notification to confirm the approval or rejection of your refund. If approved, your refund will be processed promptly.</p>
              </PolicySection>

              <PolicySection id="timelines-method" icon={Banknote} title="4. Refund Timelines & Method">
                <p>The time it takes to receive your refund depends on your original payment method:</p>
                <ul>
                  <li><strong>Prepaid Orders:</strong> For payments made via Credit/Debit Card, UPI, or Net Banking, the refund will be credited back to the original source within <strong>5-7 business days</strong> after approval.</li>
                  <li><strong>Cash on Delivery (COD):</strong> For COD orders, the refund will be processed via a bank transfer (NEFT). We will contact you for your bank details, and the amount will be credited within <strong>7-10 business days</strong> after receiving the details.</li>
                </ul>
              </PolicySection>

              <PolicySection id="deductions" icon={Percent} title="5. Possible Deductions">
                <p>The final refund amount will be the price of the item minus any applicable charges. Please note:</p>
                <ul>
                    <li>The original shipping fee and any COD charges are non-refundable.</li>
                    <li>A reverse pickup fee, as applicable for the return shipment, will be deducted from the total refund amount.</li>
                </ul>
              </PolicySection>
              
              <PolicySection id="support" icon={HelpCircle} title="6. Contact for Support">
                <p>If you haven’t received your refund within the stipulated time, we advise checking with your bank first. If you still have concerns, please do not hesitate to contact our support team. We are always here to assist you.</p>
                <p><strong>Email Us:</strong> <a href="mailto:support@vedantgurukul.com" className="text-primary underline">support@vedantgurukul.com</a></p>
              </PolicySection>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}