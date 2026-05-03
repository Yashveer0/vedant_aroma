"use client";

import Image from 'next/image';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="flex flex-col lg:flex-row items-center justify-center gap-6 md:gap-8">
      <div className="w-full lg:w-2/3 relative bg-[var(--base-100)] rounded-xl flex p-6 md:p-12 min-h-[400px] lg:min-h-0">
        <div className="flex-1 z-10">
          <p className="text-sm font-semibold text-[var(--pallete-100)] tracking-widest">
            FRESH AND TASTY
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif text-black mt-4 leading-tight">
            New Season <br /> Women's Style
          </h2>
          <p className="mt-4 text-gray-600 max-w-md">
            Discover the beauty of fashion living
          </p>
          <Link href="/shop" className="inline-block mt-8 px-8 py-3 rounded-md font-semibold bg-[var(--primary-button-theme)] hover:bg-[var(--secondary-button-theme)] text-[var(--primary-button-text)] hover:text-[var(--secondary-button-text)] transition-colors">
            SHOP NOW
          </Link>
        </div>
        <div className="flex-1 hidden md:block absolute right-0 bottom-0 top-0 w-1/2">
          <Image
            src="https://i.pinimg.com/1200x/56/95/e9/5695e9fbe54af61de6387af503be7766.jpg"
            alt="Woman in a blue suit"
            fill
            className="object-cover rounded-r-xl"
          />
        </div>
      </div>
      <div className="w-full lg:w-1/3 flex flex-col gap-6 md:gap-8">
        <Link href="/shop?tags=sale" className="block">
          <div className="bg-[var(--base-100)] p-6 sm:p-8 rounded-xl flex-1 relative overflow-hidden">
            <h3 className="text-xl sm:text-2xl font-serif font-semibold">
              Dive Into Savings <br /> On Swimwear
            </h3>
            <p className="text-base sm:text-lg mt-2 text-gray-700">
              Starting at <span className="text-red-400 font-bold">₹59.99</span>
            </p>
            <div className="absolute -right-8 -bottom-8">
              <Image src="https://i.pinimg.com/1200x/08/de/e7/08dee7d9318b38087eaf7ab667a14450.jpg" alt="Swimwear model" width={180} height={230} />
            </div>
          </div>
        </Link>
        <Link href="/shop?category=accessories" className="block">
          <div className="bg-[var(--base-100)] p-6 sm:p-8 rounded-xl flex-1 relative overflow-hidden">
            <h3 className="text-xl sm:text-2xl font-serif font-semibold">
              20% Off <br /> Accessories
            </h3>
            <p className="text-base sm:text-lg mt-2 text-gray-700">
              Starting at <span className="text-red-500 font-bold">₹59.99</span>
            </p>
            <div className="absolute right-4 bottom-4 sm:right-8 sm:bottom-8">
              <Image src="https://i.pinimg.com/1200x/d8/0e/90/d80e90c940fd042619f579ff45df2189.jpg" alt="Sunglasses" width={120} height={120} />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}