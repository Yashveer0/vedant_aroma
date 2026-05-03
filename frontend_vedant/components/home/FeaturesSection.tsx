"use client";

import { Phone, Package, BadgeCheck, Truck } from "lucide-react";

const featureItems = [
  { icon: <Phone size={40} className="mx-auto text-gray-700" />, title: "24/7 Customer Service", description: "We're here to help you with any questions or concerns you have, 24/7." },
  { icon: <Package size={40} className="mx-auto text-gray-700" />, title: "14-Day Money Back", description: "If you're not satisfied with your purchase, simply return it within 14 days for a refund." },
  { icon: <BadgeCheck size={40} className="mx-auto text-gray-700" />, title: "Our Guarantee", description: "We stand behind our products and services and guarantee your satisfaction." },
  { icon: <Truck size={40} className="mx-auto text-gray-700" />, title: "Shipping Worldwide", description: "We ship our products worldwide, making them accessible to customers everywhere." },
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