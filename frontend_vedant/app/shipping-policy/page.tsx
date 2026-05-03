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
      <Icon className="h-8 w-8 flex-shrink-0 text-primary" />
      <h2 className="ml-4 text-2xl font-semibold text-[var(--pallete-300)]">{title}</h2>
    </div>
    <hr className="my-4 border-gray-200" />
    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">{children}</div>
  </section>
);

export default function ShippingPolicyPage() {
  const sections = [
    { id: "processing-time", title: "Order Processing Time" },
    { id: "shipping-partners", title: "Our Shipping Partners & Timelines" },
    { id: "order-tracking", title: "Tracking Your Order" },
    { id: "international-shipping", title: "International Shipping" },
    { id: "damaged-lost", title: "Damaged or Lost Packages" },
    { id: "address-accuracy", title: "Address Accuracy" },
  ];

  return (
    <div className="min-h-screen bg-[var(--base-10)]">
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-12 md:py-20">
        
        {/* --- Header rewritten for Vedant Gurukul Aroma brand --- */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-[var(--pallete-500)] md:text-5xl font-serif">
            Shipping Policy
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Delivering wellness and ancient aromas from our Gurukul to your home.
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

          {/* --- Main content area with updated policies reflecting Shiprocket usage --- */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm md:p-12">
              
              <PolicySection id="processing-time" icon={Clock} title="1. Order Processing Time">
                <p>Each order is a sacred trust. We handle your chosen aroma oils and wellness products with the utmost care and reverence. Our processing times are as follows:</p>
                <ul>
                  <li>All orders are mindfully packed and prepared for dispatch within <strong>1-2 business days</strong>.</li>
                  <li>Once packed, your order is handed over to our logistics platform to be sent via a trusted courier partner.</li>
                  <li>We process orders from Monday to Saturday, excluding public holidays.</li>
                </ul>
              </PolicySection>

              <PolicySection id="shipping-partners" icon={Truck} title="2. Our Shipping Partners & Timelines">
                <p>To ensure reliable and efficient delivery across India, we partner with <strong>Shiprocket</strong>, a leading logistics platform. This allows us to ship through multiple reputed courier services like Delhivery, Blue Dart, Xpressbees, and more.</p>
                <ul>
                  <li><strong>Estimated Delivery Time:</strong> Delivery timelines are estimates and typically range from <strong>3-7 business days</strong> after dispatch, depending on your location and the courier partner assigned.</li>
                  <li><strong>Shipping Costs:</strong> We offer complimentary shipping on all prepaid orders over <strong>₹999</strong>. For orders below this amount, a flat fee of <strong>₹70</strong> is applied.</li>
                  <li><strong>Cash on Delivery (COD):</strong> An additional handling fee of <strong>₹50</strong> is applicable on all COD orders. Please note that COD serviceability depends on your pin code and is subject to the courier partner's policies.</li>
                </ul>
              </PolicySection>

              <PolicySection id="order-tracking" icon={PackageSearch} title="3. Tracking Your Order">
                <p>As soon as your package is dispatched, you will receive a shipping confirmation email and SMS from us, which includes your unique tracking ID and a link. This link will allow you to monitor your order's journey and see the specific courier partner handling your delivery.</p>
              </PolicySection>
              
              <PolicySection id="international-shipping" icon={Globe} title="4. International Shipping">
                <p>Currently, Vedant Gurukul Aroma ships exclusively within India. We are working diligently to share our ancient wellness traditions with a global audience. Please stay connected for future updates!</p>
              </PolicySection>

              <PolicySection id="damaged-lost" icon={ShieldAlert} title="5. Damaged or Lost Packages">
                <p>We take great care in packaging our products. In the unfortunate event that your order arrives damaged, please contact us within <strong>48 hours</strong> of delivery at <a href="mailto:support@vedantgurukul.com" className="text-primary underline">support@vedantgurukul.com</a> with your Order ID and photos of the damage. We will promptly assist you and coordinate with our courier partner to resolve the issue.</p>
              </PolicySection>

              <PolicySection id="address-accuracy" icon={Home} title="6. Address Accuracy">
                <p>To ensure timely and successful delivery, please verify that your shipping address is complete and correct during checkout. Vedant Gurukul is not responsible for delays or non-delivery resulting from an incorrect or incomplete address provided by the customer.</p>
              </PolicySection>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}