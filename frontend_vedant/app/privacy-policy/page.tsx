"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  ClipboardList, 
  Settings, 
  Share2, 
  Shield, 
  Cookie, 
  UserCheck, 
  FileClock, 
  Mail 
} from "lucide-react";
import { ReactNode } from "react";

// Reusable component for each policy section
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

export default function PrivacyPolicyPage() {
  const sections = [
    { id: "info-collected", title: "Information We Collect" },
    { id: "info-use", title: "How We Use Your Information" },
    { id: "info-sharing", title: "Sharing Your Information" },
    { id: "info-security", title: "Data Security" },
    { id: "cookies", title: "Cookies & Tracking Technologies" },
    { id: "your-rights", title: "Your Rights & Control" },
    { id: "policy-changes", title: "Policy Updates" },
    { id: "contact-us", title: "Contact Us" },
  ];

  return (
    <div className="min-h-screen bg-[var(--base-10)]">
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
        
        {/* --- Header rewritten for Vedant Gurukul Aroma brand --- */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-[var(--pallete-500)] md:text-5xl font-serif">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Your trust is a sacred bond. Here’s how we honor and protect your privacy.
          </p>
          {/* <p className="mt-2 text-sm text-gray-500">
            Last Updated: 16 October 2025
          </p> */}
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* --- Sticky navigation (themed) --- */}
          <aside className="lg-col-span-1 lg:sticky lg:top-24 h-fit">
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
              
              <PolicySection id="info-collected" icon={ClipboardList} title="1. Information We Collect">
                <p>To provide you with our products and services, we collect information when you interact with our website. This may include:</p>
                <ul>
                  <li><strong>Personal Details:</strong> Your name, email, shipping address, and phone number when you create an account, place an order, or subscribe to our newsletter.</li>
                  <li><strong>Order Information:</strong> Details about the products and services you purchase and your billing information.</li>
                  <li><strong>Browsing Data:</strong> Information about how you navigate our site, which products you view, and items you add to your cart or wishlist. This helps us improve your experience.</li>
                </ul>
                <p><strong>Note on Payments:</strong> Your payment details are processed securely by our trusted payment partner Razorpay. We do not store your credit card or full payment information on our servers.</p>
              </PolicySection>

              <PolicySection id="info-use" icon={Settings} title="2. How We Use Your Information">
                <p>We use your information to operate our business and enhance your wellness journey with us. This includes:</p>
                <ul>
                    <li><strong>Fulfilling Your Orders:</strong> Processing payments, arranging for shipping, and sending you order confirmations and invoices.</li>
                    <li><strong>Improving Our Offerings:</strong> Understanding your preferences to recommend products and content that may be beneficial for you.</li>
                    <li><strong>Communication:</strong> Sending you updates about your order and, if you opt-in, sharing knowledge about new products, wellness articles, and exclusive offers.</li>
                    <li><strong>Customer Support:</strong> Assisting you with your inquiries and ensuring your satisfaction.</li>
                </ul>
              </PolicySection>

              <PolicySection id="info-sharing" icon={Share2} title="3. Sharing Your Information">
                <p><strong>Your privacy is fundamental to our principles.</strong> We do not sell or rent your personal information. We only share data with essential partners who facilitate our services, such as:</p>
                <ul>
                    <li>Our trusted courier partners to deliver your orders.</li>
                    <li>Our secure payment gateways to process your transactions.</li>
                    <li>Technology partners who help us maintain and improve our website.</li>
                </ul>
                <p>These partners are bound by confidentiality agreements and are only authorized to use your information for the specific services they provide to us.</p>
              </PolicySection>
              
              <PolicySection id="info-security" icon={Shield} title="4. Data Security">
                <p>We implement a variety of industry-standard security measures, including SSL (Secure Socket Layer) encryption, to safeguard your personal information when you place an order or access your account.</p>
              </PolicySection>

              <PolicySection id="cookies" icon={Cookie} title="5. Cookies & Tracking Technologies">
                <p>We use cookies and similar technologies to help our site function effectively. These small data files allow us to remember what's in your cart, understand your browsing preferences, and gather data about site traffic so we can improve our digital offerings.</p>
              </PolicySection>

              <PolicySection id="your-rights" icon={UserCheck} title="6. Your Rights & Control">
                <p>You have control over your personal information. You have the right to:</p>
                <ul>
                    <li>Access the personal information we hold about you.</li>
                    <li>Request that we correct any inaccurate information.</li>
                    <li>Opt-out of marketing communications at any time by clicking the "unsubscribe" link in our emails.</li>
                </ul>
              </PolicySection>

              <PolicySection id="policy-changes" icon={FileClock} title="7. Policy Updates">
                <p>We may update this privacy policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will post any changes on this page and update the "Last Updated" date.</p>
              </PolicySection>
              
              <PolicySection id="contact-us" icon={Mail} title="8. Contact Us">
                <p>If you have any questions or concerns regarding your privacy, please do not hesitate to contact us. We are here to provide clarity and assistance.</p>
                <p><strong>Email:</strong> <a href="mailto:support@vedantgurukul.com" className="text-primary underline">support@vedantgurukul.com</a></p>
              </PolicySection>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}