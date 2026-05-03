"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- Data remains the same ---
const trendingCategories = [
    { 
        name: "Vastu Correction Oils", 
        image: "/images/category3.webp",
        href: "/shop?category=Vastu%20Correction%20Oils"
    },
    { 
        name: "Astrology Oils", 
        image: "/images/category4.webp",
        href: "/shop?category=Astrology%20Oils"
    },
    { 
        name: "Yoga & Healing Oils", 
        image: "/images/category5.webp",
        href: "/shop?category=Yoga%20%26%20Healing%20Oils"
    },
    { 
        name: "Aroma Medicines", 
        image: "/images/category1.webp",
        href: "/shop?category=Aroma%20Medicines"
    },
    { 
        name: "Aark Ayurveda", 
        image: "/images/category2.webp",
        href: "/shop?category=Aark%20Ayurveda"
    },
    { 
        name: "View All", 
        image: "/images/category5.webp",
        href: "/shop"
    },
];

export function CategoryScroller() {
    const scrollContainer = useRef<HTMLDivElement>(null);

    const handleScroll = (direction: "left" | "right") => {
        if (scrollContainer.current) {
            scrollContainer.current.scrollBy({
                left: direction === "left" ? -300 : 300,
                behavior: "smooth",
            });
        }
    };

    return (
        <section className="py-12 md:py-16 bg-green-50/50 overflow-hidden">
             {/* Custom CSS to hide scrollbar */}
             <style jsx>{`
                .hide-scrollbar {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;  /* Chrome, Safari, Opera */
                }
            `}</style>
            
            <div className="container mx-auto">
                {/* UPDATED: Title and Subtitle section */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-serif text-gray-800 mb-4">
                        Explore Our Offerings
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        From specialized Aroma Blends to expert consultations in Vastu and Astrology, discover our holistic approach to wellness.
                    </p>
                </div>
                
                <div className="relative">
                    <Button
                        onClick={() => handleScroll("left")}
                        variant="outline"
                        size="icon"
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md bg-white hidden lg:flex"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={24} />
                    </Button>
                    <div
                        ref={scrollContainer}
                        className="flex items-start space-x-4 lg:space-x-8 overflow-x-auto pb-4 px-4 lg:px-14 hide-scrollbar"
                    >
                        {trendingCategories.map((category) => (
                            <Link key={category.name} href={category.href} className="flex-shrink-0 group">
                                <div className="flex flex-col items-center w-32 md:w-40 text-center">
                                    <div className="w-32 h-32 md:w-40 md:h-40 relative rounded-full overflow-hidden shadow-sm group-hover:shadow-lg transition-shadow duration-300 border-4 border-white">
                                        <Image
                                            src={category.image}
                                            alt={category.name}
                                            fill
                                            sizes="(max-width: 768px) 128px, 160px"
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <p className="mt-4 text-base font-semibold text-gray-800 group-hover:text-[var(--base-200)] transition-colors">
                                        {category.name}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <Button
                        onClick={() => handleScroll("right")}
                        variant="outline"
                        size="icon"
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-md bg-white hidden lg:flex"
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={24} />
                    </Button>
                </div>
            </div>
        </section>
    );
}