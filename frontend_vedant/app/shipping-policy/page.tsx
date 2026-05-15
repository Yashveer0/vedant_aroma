"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Clock,
  Truck,
  IndianRupee,
  PackageSearch,
  ShieldAlert,
  Home,
  Globe,
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

export default function ShippingPolicyPage() {
  const sections = [
    { id: "processing-time", title: "Processing Time" },
    { id: "shipping-partners", title: "Partners & Timelines" },
    { id: "charges", title: "Shipping Charges" },
    { id: "order-tracking", title: "Tracking" },
    { id: "international-shipping", title: "Shipping Area" },
    { id: "damaged-lost", title: "Damaged or Lost" },
    { id: "address-accuracy", title: "Address Accuracy" },
  ];

  return (
    <div className="min-h-screen bg-[var(--base-10)]">
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-[var(--pallete-500)] md:text-5xl font-serif">
            Shipping Policy
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Order processing, delivery timelines, charges, tracking, and support details.
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
              <PolicySection id="processing-time" icon={Clock} title="1. Order Processing Time">
                <ul>
                  <li>Orders are processed within <strong>1-2 business days</strong> after payment confirmation.</li>
                  <li>Orders are processed Monday to Saturday, excluding public holidays.</li>
                  <li>Processing may take longer during high order volume, sale periods, weather disruption, or courier restrictions.</li>
                </ul>
              </PolicySection>

              <PolicySection id="shipping-partners" icon={Truck} title="2. Shipping Partners & Estimated Delivery">
                <p>
                  We ship orders through trusted courier/logistics partners, including services arranged through Shiprocket where applicable.
                </p>
                <ul>
                  <li><strong>Estimated delivery:</strong> 3-7 business days after dispatch for most serviceable Indian pin codes.</li>
                  <li>Remote areas, courier disruptions, holidays, or incorrect address details may extend delivery time.</li>
                  <li>Delivery timelines are estimates and not guaranteed unless specifically stated on the order.</li>
                </ul>
              </PolicySection>

              <PolicySection id="charges" icon={IndianRupee} title="3. Shipping Charges">
                <ul>
                  <li>Prepaid orders above <strong>Rs. 999</strong> qualify for free standard shipping.</li>
                  <li>Orders below Rs. 999 may have a flat shipping fee of <strong>Rs. 70</strong>.</li>
                  <li>Cash on Delivery, if available for your pin code, may include an additional handling fee of <strong>Rs. 50</strong>.</li>
                  <li>Final shipping and COD charges are shown at checkout before payment/order confirmation.</li>
                </ul>
              </PolicySection>

              <PolicySection id="order-tracking" icon={PackageSearch} title="4. Tracking Your Order">
                <p>
                  Once dispatched, tracking details are shared by email, SMS, WhatsApp, or order history where available. Tracking may take up to 24 hours to become active after dispatch.
                </p>
              </PolicySection>

              <PolicySection id="international-shipping" icon={Globe} title="5. Shipping Area">
                <p>
                  We currently ship within India only. International shipping is not available at this time.
                </p>
              </PolicySection>

              <PolicySection id="damaged-lost" icon={ShieldAlert} title="6. Damaged, Missing, or Lost Packages">
                <p>
                  If your order arrives damaged, incorrect, missing, or visibly tampered with, contact us within <strong>48 hours of delivery</strong> with your Order ID and clear photos/video of the package and product.
                </p>
                <p><strong>Email:</strong> <a href={`mailto:${supportEmail}`} className="text-primary underline">{supportEmail}</a></p>
                <p><strong>Phone:</strong> {supportPhone}</p>
              </PolicySection>

              <PolicySection id="address-accuracy" icon={Home} title="7. Address Accuracy">
                <p>
                  Customers are responsible for providing a complete and correct shipping address, pin code, phone number, and availability for delivery. We are not responsible for delays or non-delivery caused by incorrect/incomplete information provided by the customer.
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
