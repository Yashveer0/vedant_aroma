"use client";

import Image from 'next/image';
import Link from 'next/link';

// Static data for the decorative categories.
// This can be kept here as it's specific to this component.
const decorCategories = [
    { name: 'Vases & Pots', image: 'https://i.pinimg.com/736x/da/2e/4c/da2e4c8a2ea912ab7a01bb476bff6aa1.jpg' },
    { name: 'Wall Art', image: 'https://i.pinimg.com/1200x/f7/ea/d0/f7ead02fe6955e841c431fba560bf439.jpg' },
    { name: 'Lamps', image: 'https://i.pinimg.com/1200x/58/35/ae/5835ae5dfcf985c2edbc10a504194036.jpg' },
    { name: 'Rugs', image: 'https://i.pinimg.com/736x/cf/62/7b/cf627b0e8ec6937aff3f4235218af714.jpg' },
    { name: 'Sculptures', image: 'https://i.pinimg.com/736x/37/17/28/371728a2e5519521e764def31992a810.jpg' },
    { name: 'Mirrors', image: 'https://i.pinimg.com/736x/d7/3a/6b/d73a6bd9f4cd776c86a6d2f991d0a455.jpg' },
];

export function StyleYourSpace() {
    return (
        <section className="my-12 md:my-16">
            <h2 className="text-3xl md:text-4xl font-serif text-[var(--primary-text-theme)] text-center mb-12">
                Style Your Space
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
                {decorCategories.map((category) => (
                    // FIX: Corrected the template literal from ₹{...} to ${...} and made it URL-friendly
                    <Link key={category.name} href={`/shop/decoratives?category=${category.name.toLowerCase().replace(/ & /g, '-')}`} className="group">
                        <div className="relative aspect-square w-full rounded-full overflow-hidden shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                            <Image
                                src={category.image}
                                alt={category.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <p className="mt-4 text-center text-base font-semibold text-[var(--secondary-text-theme)] group-hover:text-[var(--primary-text-theme)] transition-colors">
                            {category.name}
                        </p>
                    </Link>
                ))}
            </div>
        </section>
    );
}