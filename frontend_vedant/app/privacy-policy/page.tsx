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
  Mail,
} from "lucide-react";
import { ReactNode } from "react";

const supportEmail = "vedant.gurukul7@gmail.com";
const supportPhone = "+91 79917 49998, +91 82998 54442";
const businessAddress = "K-911, Sector-K, Ashiyana, Kanpur Road, Lucknow, Uttar Pradesh 226012";

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
    { id: "info-use", title: "How We Use Information" },
    { id: "payments", title: "Payments & Razorpay" },
    { id: "info-sharing", title: "Information Sharing" },
    { id: "info-security", title: "Security & Retention" },
    { id: "cookies", title: "Cookies" },
    { id: "your-rights", title: "Your Rights" },
    { id: "contact-us", title: "Contact Us" },
  ];

  return (
    <div className="min-h-screen bg-[var(--base-10)]">
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-[var(--pallete-500)] md:text-5xl font-serif">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            How Vedant Gurukul Aroma Mart collects, uses, protects, and shares customer information.
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
              <PolicySection id="info-collected" icon={ClipboardList} title="1. Information We Collect">
                <p>We collect only the information needed to run our store, process orders, deliver products, and support customers.</p>
                <ul>
                  <li><strong>Identity and contact details:</strong> name, email address, phone number, billing address, and shipping address.</li>
                  <li><strong>Order details:</strong> products purchased, quantity, order value, invoice details, delivery status, returns, cancellations, and refunds.</li>
                  <li><strong>Account details:</strong> login information, saved addresses, wishlist, and order history when you create an account.</li>
                  <li><strong>Support details:</strong> messages sent through our contact form, WhatsApp, email, grievance form, or customer support channels.</li>
                  <li><strong>Technical data:</strong> device, browser, IP address, cookies, and website usage data used for security and performance.</li>
                </ul>
              </PolicySection>

              <PolicySection id="info-use" icon={Settings} title="2. How We Use Your Information">
                <p>We use customer information for legitimate business, legal, and customer support purposes, including:</p>
                <ul>
                  <li>Creating and managing customer accounts.</li>
                  <li>Processing orders, payments, invoices, shipping, returns, cancellations, and refunds.</li>
                  <li>Sending order confirmations, delivery updates, support replies, and service notices.</li>
                  <li>Improving product information, website performance, fraud prevention, and customer experience.</li>
                  <li>Complying with tax, accounting, consumer protection, payment aggregator, and applicable legal requirements.</li>
                </ul>
              </PolicySection>

              <PolicySection id="payments" icon={Shield} title="3. Payments & Razorpay">
                <p>
                  Online payments on our website are processed through Razorpay or other authorised payment partners. We do not store full card numbers, CVV, UPI PINs, net banking passwords, or other payment instrument credentials on our servers.
                </p>
                <p>
                  To complete a transaction, Razorpay may receive required order and customer details such as name, email, phone number, amount, order ID, and payment status. Refunds for prepaid orders are initiated back to the original payment source wherever supported by the payment partner.
                </p>
              </PolicySection>

              <PolicySection id="info-sharing" icon={Share2} title="4. Information Sharing">
                <p>We do not sell customer personal information. We share information only when required to provide our services or meet legal obligations.</p>
                <ul>
                  <li><strong>Payment partners:</strong> to process payments, refunds, settlements, fraud checks, and chargeback queries.</li>
                  <li><strong>Courier and logistics partners:</strong> to pack, ship, track, and deliver orders.</li>
                  <li><strong>Technology partners:</strong> to host, maintain, secure, and improve the website.</li>
                  <li><strong>Government, tax, legal, or regulatory authorities:</strong> where disclosure is required under applicable law.</li>
                </ul>
              </PolicySection>

              <PolicySection id="info-security" icon={FileClock} title="5. Security & Retention">
                <p>
                  We use reasonable technical and organisational safeguards to protect customer information, including access controls and secure payment processing. No internet transmission is completely risk free, but we work to protect data in line with the nature of our business.
                </p>
                <p>
                  We retain customer information only as long as necessary for order fulfilment, customer support, fraud prevention, tax/accounting records, legal compliance, and dispute resolution.
                </p>
              </PolicySection>

              <PolicySection id="cookies" icon={Cookie} title="6. Cookies & Similar Technologies">
                <p>
                  We use cookies and similar technologies to keep the website functional, remember cart/session details, understand website performance, and improve browsing experience. You may disable cookies in your browser, but some features may not work correctly.
                </p>
              </PolicySection>

              <PolicySection id="your-rights" icon={UserCheck} title="7. Your Rights & Choices">
                <p>
                  You may request access, correction, update, deletion, or withdrawal of consent for your personal information, subject to applicable law and legitimate business/legal retention needs. You can also opt out of marketing communication where applicable.
                </p>
              </PolicySection>

              <PolicySection id="contact-us" icon={Mail} title="8. Contact Us">
                <p>For privacy requests, order support, payment queries, or grievances, contact us at:</p>
                <p><strong>Email:</strong> <a href={`mailto:${supportEmail}`} className="text-primary underline">{supportEmail}</a></p>
                <p><strong>Phone:</strong> {supportPhone}</p>
                <p><strong>Address:</strong> {businessAddress}</p>
                <p>We aim to acknowledge and resolve customer queries within 4 business days wherever possible.</p>
              </PolicySection>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
