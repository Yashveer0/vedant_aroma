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

export default function TermsAndConditionsPage() {
  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "account", title: "Your Account" },
    { id: "products", title: "Products" },
    { id: "orders-payment", title: "Orders & Payment" },
    { id: "policies", title: "Shipping, Return & Refund" },
    { id: "customer", title: "Customer Responsibilities" },
    { id: "liability", title: "Liability" },
    { id: "governing-law", title: "Governing Law" },
    { id: "contact", title: "Contact" },
  ];

  return (
    <div className="min-h-screen bg-[var(--base-10)]">
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-[var(--pallete-500)] md:text-5xl font-serif">
            Terms & Conditions
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            General terms for using Vedant Gurukul Aroma Mart and purchasing our aroma oils.
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
              <PolicySection id="introduction" icon={BookText} title="1. Introduction">
                <p>
                  Welcome to Vedant Gurukul Aroma Mart. These Terms & Conditions govern access to our website, customer account features, product information, orders, payments, shipping, cancellations, returns, and refunds.
                </p>
                <p>
                  By using this website or placing an order, you agree to these Terms, our <a href="/privacy-policy" className="text-primary underline">Privacy Policy</a>, <a href="/shipping-policy" className="text-primary underline">Shipping Policy</a>, <a href="/return-policy" className="text-primary underline">Return Policy</a>, <a href="/refund-policy" className="text-primary underline">Refund Policy</a>, and <a href="/cancellation-policy" className="text-primary underline">Cancellation Policy</a>.
                </p>
              </PolicySection>

              <PolicySection id="account" icon={UserCircle2} title="2. Your Account">
                <p>
                  You are responsible for keeping your account details, password, delivery address, and contact information accurate and secure. Please notify us promptly if you suspect unauthorised account activity.
                </p>
              </PolicySection>

              <PolicySection id="products" icon={Gem} title="3. Products & Information">
                <p>
                  We sell aroma oils and ritual fragrance blends. Product descriptions, images, ingredients, volumes, prices, availability, and offers are provided in good faith and may be updated from time to time.
                </p>
                <ul>
                  <li>Our products are aroma oils/fragrance blends and are not sold as drugs, medical products, or guaranteed cures.</li>
                  <li>Customers should read the product label, ingredients, usage instructions, and warnings before use.</li>
                  <li>Colours, bottle design, packaging, or labels may vary slightly due to display settings, batch updates, or packaging availability.</li>
                  <li>We may modify, pause, or discontinue any product or offer without prior notice.</li>
                </ul>
              </PolicySection>

              <PolicySection id="orders-payment" icon={ShoppingCart} title="4. Orders & Payment">
                <p>
                  By placing an order, you confirm that all details provided are true, accurate, and complete. Orders are accepted subject to product availability, successful payment authorisation, and our internal verification checks.
                </p>
                <ul>
                  <li>Prices are listed in Indian Rupees unless stated otherwise.</li>
                  <li>Online payments are processed through Razorpay or other authorised payment partners.</li>
                  <li>We do not store card numbers, CVV, UPI PINs, net banking passwords, or other payment instrument credentials.</li>
                  <li>Razorpay is a payment facilitator. Product, delivery, cancellation, return, and refund queries must be raised directly with Vedant Gurukul Aroma Mart.</li>
                  <li>We reserve the right to refuse or cancel orders due to incorrect pricing, suspected fraud, stock issues, serviceability restrictions, or violation of these Terms.</li>
                </ul>
              </PolicySection>

              <PolicySection id="policies" icon={Copyright} title="5. Shipping, Cancellation, Return & Refund">
                <p>
                  Shipping timelines, cancellation rules, return conditions, and refund timelines are clearly published for customers before and after purchase.
                </p>
                <ul>
                  <li><a href="/shipping-policy" className="text-primary underline">Shipping Policy</a> explains order processing, shipping charges, delivery timelines, tracking, and damaged shipment support.</li>
                  <li><a href="/cancellation-policy" className="text-primary underline">Cancellation Policy</a> explains when an order can be cancelled and how approved prepaid cancellations are refunded.</li>
                  <li><a href="/return-policy" className="text-primary underline">Return Policy</a> explains eligibility, 7-day return window, product condition, and return process.</li>
                  <li><a href="/refund-policy" className="text-primary underline">Refund Policy</a> explains refund eligibility, method, deductions, and timelines.</li>
                </ul>
              </PolicySection>

              <PolicySection id="customer" icon={ShieldAlert} title="6. Customer Responsibilities">
                <p>Customers agree to:</p>
                <ul>
                  <li>Provide accurate account, billing, payment, and shipping information.</li>
                  <li>Use the website only for lawful purposes.</li>
                  <li>Not misuse offers, coupons, payment methods, return requests, chargebacks, or customer support channels.</li>
                  <li>Contact us directly for product, delivery, cancellation, return, refund, or payment support before raising external disputes wherever possible.</li>
                </ul>
              </PolicySection>

              <PolicySection id="liability" icon={ShieldAlert} title="7. Limitation of Liability">
                <p>
                  To the maximum extent permitted by law, Vedant Gurukul Aroma Mart will not be liable for indirect, incidental, special, punitive, or consequential losses arising from website use, product use, delivery delays, third-party service interruptions, or payment gateway outages.
                </p>
              </PolicySection>

              <PolicySection id="governing-law" icon={Landmark} title="8. Governing Law">
                <p>
                  These Terms are governed by the laws of India. Subject to applicable consumer protection laws, disputes will be handled by competent courts having jurisdiction over Lucknow, Uttar Pradesh.
                </p>
              </PolicySection>

              <PolicySection id="contact" icon={Mail} title="9. Contact Information">
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
