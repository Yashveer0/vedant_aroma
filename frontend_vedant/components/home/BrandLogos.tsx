"use client";

import Image from 'next/image';

const brands = [
    { name: "Calvin Klein", logoUrl: "/calvin-klein.png" },
    { name: "Zara", logoUrl: "https://cdn.worldvectorlogo.com/logos/zara-2.svg" },
    { name: "Levi's", logoUrl: "/Levis-Logo.png" },
    { name: "Gucci", logoUrl: "https://cdn.worldvectorlogo.com/logos/gucci.svg" },
    { name: "Chanel", logoUrl: "https://cdn.worldvectorlogo.com/logos/chanel-2.svg" },
];

export function BrandLogos() {
    return (
        <section className="my-12 md:my-20">
            <h2 className="text-3xl md:text-4xl font-serif text-[var(--primary-text-theme)] text-center mb-12">
                Shop By Brand
            </h2>
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-6 md:gap-x-16">
                {brands.map((brand) => (
                    <a href="#" key={brand.name} className="relative h-12 w-24" title={brand.name}>
                        <Image
                            src={brand.logoUrl}
                            alt={`${brand.name} logo`}
                            fill
                            className="object-contain filter grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
                        />
                    </a>
                ))}
            </div>
        </section>
    );
}