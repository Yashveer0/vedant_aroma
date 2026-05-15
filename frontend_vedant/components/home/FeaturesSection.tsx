"use client";

import { Phone, Package, BadgeCheck, Truck } from "lucide-react";

const featureItems = [
  { icon: <Phone size={40} className="mx-auto text-gray-700" />, title: "Customer Support", description: "Reach us by phone, email, WhatsApp, or the contact form for order and product queries." },
  { icon: <Package size={40} className="mx-auto text-gray-700" />, title: "7-Day Returns", description: "Eligible unopened products can be returned within 7 days of delivery." },
  { icon: <BadgeCheck size={40} className="mx-auto text-gray-700" />, title: "Quality Checked", description: "Every aroma oil is packed carefully with a focus on purity, labeling, and safe delivery." },
  { icon: <Truck size={40} className="mx-auto text-gray-700" />, title: "India Shipping", description: "Orders are shipped across India through trusted courier partners." },
];

export function FeaturesSection() {
  return (
    <section className="my-12 md:my-16 bg-[var(--base-10)] rounded-2xl p-8 md:p-12">
      <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
        {featureItems.map((item) => (
          <div key={item.title} className="text-center">
            {item.icon}
            <h3 className="mt-4 text-lg font-semibold text-gray-800">{item.title}</h3>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
