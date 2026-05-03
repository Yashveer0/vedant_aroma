"use client";

import React from 'react';
import { Leaf, Heart, Sparkles, MapPin, Truck, Award } from 'lucide-react';

const features = [
    {
        icon: Leaf,
        title: "100% Natural",
        description: "Pure, organic ingredients sourced directly from nature with no artificial additives or chemicals."
    },
    {
        icon: Heart,
        title: "Cruelty Free",
        description: "Ethically crafted products that are never tested on animals, honoring all living beings."
    },
    {
        icon: Sparkles,
        title: "Cure For Sure",
        description: "Traditional Vedic formulations backed by centuries of proven healing effectiveness."
    },
    {
        icon: MapPin,
        title: "Pan India Shipping",
        description: "We deliver authentic Ayurvedic wellness to every corner of India, no matter where you are."
    },
    {
        icon: Truck,
        title: "Super Fast Delivery",
        description: "Quick and reliable shipping to ensure your wellness journey begins without delay."
    }
];

export function WhyChooseUsSection() {
    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-white via-green-50/30 to-white relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-20 left-10 text-green-100 opacity-40">
                <Leaf size={80} className="rotate-12" />
            </div>
            <div className="absolute bottom-20 right-10 text-amber-100 opacity-40">
                <Leaf size={100} className="-rotate-12" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="flex justify-center items-center gap-3 mb-6">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--text-primary)]"></div>
                        <Award className="h-6 w-6 text-[var(--text-primary)]" />
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--text-primary)]"></div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-[var(--text-primary)] mb-4">
                        Why Choose Vedant Aroma?
                    </h2>
                    <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
                        Experience the difference of authentic Ayurvedic excellence with every product
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
                    {features.map((feature, index) => {
                        const IconComponent = feature.icon;
                        return (
                            <div 
                                key={index}
                                className="group text-center"
                            >
                                {/* Icon Circle */}
                                <div className="relative mx-auto mb-6 w-32 h-32 md:w-36 md:h-36">
                                    {/* Animated ring on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--text-primary)] to-[var(--base-200)] rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                                    <div className="absolute inset-2 bg-gradient-to-br from-[var(--text-primary)] to-[var(--base-200)] rounded-full flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
                                        <IconComponent className="h-14 w-14 md:h-16 md:w-16 text-white" strokeWidth={1.5} />
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-lg md:text-xl font-bold text-[var(--card-text)] mb-3 group-hover:text-[var(--text-primary)] transition-colors duration-300">
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed px-2">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Decorative Line */}
                <div className="mt-16 flex justify-center">
                    <div className="flex items-center gap-2">
                        <div className="h-px w-20 bg-gradient-to-r from-transparent to-[var(--text-primary)]/50"></div>
                        <Leaf className="h-5 w-5 text-[var(--text-primary)]" />
                        <div className="h-px w-20 bg-gradient-to-l from-transparent to-[var(--text-primary)]/50"></div>
                    </div>
                </div>

            </div>
        </section>
    );
}