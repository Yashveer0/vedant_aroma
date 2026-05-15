"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Leaf, Award, Heart, Sparkles, ArrowRight, Users } from 'lucide-react';

export function AboutSection() {
    return (
        <section className="py-16 md:py-24 bg-white relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-green-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
                    
                    {/* Left Content Section */}
                    <div className="space-y-6">
                        
                        {/* Section Label */}
                        <div className="flex items-center gap-3">
                            <div className="h-px w-12 bg-gradient-to-r from-[var(--text-primary)] to-transparent"></div>
                            <span className="text-sm font-bold text-[var(--text-primary)] tracking-wider uppercase">About Vedant Gurukul</span>
                            <Leaf className="h-5 w-5 text-[var(--text-primary)]" />
                        </div>

                        {/* Heading */}
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-[var(--card-text)] leading-tight">
                            A Legacy of 
                            <span className="block text-[var(--text-primary)] mt-2">
                                Vedic Wisdom
                            </span>
                        </h2>

                        {/* Description */}
                        <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
                            <p className="text-base md:text-lg">
                                <span className="font-semibold text-[var(--card-text)]">Vedant Gurukul Aroma Mart</span> offers aroma oils and ritual blends inspired by Vastu Shastra, Astrology, Yoga, and Aromatherapy traditions.
                            </p>
                            <p className="text-base">
                                Our blends are curated under the guidance of experienced practitioners including <span className="font-semibold text-[var(--card-text)]">Aacharya Dr. Manish</span> and <span className="font-semibold text-[var(--card-text)]">Ms. Anisha Saxena</span>.
                            </p>
                            <p className="text-base">
                                We focus on pure fragrance, careful packaging, clear product information, and dependable customer support for every order.
                            </p>
                        </div>

                        {/* Stats/Features */}
                        <div className="grid grid-cols-3 gap-6 pt-6">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center h-14 w-14 bg-gradient-to-br from-[var(--text-primary)] to-[var(--base-200)] rounded-2xl mb-3 shadow-lg">
                                    <Award className="h-7 w-7 text-white" />
                                </div>
                                <p className="text-2xl font-bold text-[var(--text-primary)]">20+</p>
                                    <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">Brand Experience</p>
                            </div>
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center h-14 w-14 bg-gradient-to-br from-[var(--text-primary)] to-[var(--base-200)] rounded-2xl mb-3 shadow-lg">
                                    <Users className="h-7 w-7 text-white" />
                                </div>
                                <p className="text-2xl font-bold text-[var(--text-primary)]">Expert</p>
                                    <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">Curation</p>
                            </div>
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center h-14 w-14 bg-gradient-to-br from-[var(--text-primary)] to-[var(--base-200)] rounded-2xl mb-3 shadow-lg">
                                    <Heart className="h-7 w-7 text-white" />
                                </div>
                                <p className="text-2xl font-bold text-[var(--text-primary)]">5K+</p>
                                <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">Happy Clients</p>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="pt-6">
                            <Button 
                                asChild 
                                size="lg"
                                className="bg-[var(--text-primary)] text-white hover:bg-[var(--base-200)] h-12 px-8 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                <Link href="/about-us" className="flex items-center gap-2">
                                    Discover Our Journey
                                    <ArrowRight size={18} />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Right Image Section */}
                    <div className="relative">
                        
                        {/* Main Image Container */}
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                            <div className="aspect-[4/5] relative">
                                {/* Replace with your actual image */}
                                <Image
                                    src="/images/about-vedant.png"
                                    alt="Vedant Gurukul - Vastu and Astrology Consultation"
                                    fill
                                    className="object-cover"
                                />
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-green-900/40 to-transparent"></div>
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute -top-6 -right-6 h-32 w-32 bg-gradient-to-br from-[var(--text-primary)] to-[var(--base-200)] rounded-3xl -z-10 rotate-12"></div>
                        <div className="absolute -bottom-6 -left-6 h-32 w-32 bg-gradient-to-br from-amber-200 to-orange-200 rounded-3xl -z-10 -rotate-12"></div>

                        {/* Floating Badge */}
                        <div className="absolute -bottom-8 -right-8 bg-white rounded-2xl p-6 shadow-2xl border border-green-100 max-w-[200px]">
                            <div className="flex items-start gap-3">
                                <div className="h-12 w-12 bg-gradient-to-br from-[var(--text-primary)] to-[var(--base-200)] rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-[var(--text-secondary)] mb-1">Top Rated</p>
                                    <p className="text-sm font-bold text-[var(--card-text)] leading-tight">Curated Aroma Oils</p>
                                </div>
                            </div>
                        </div>

                        {/* Pattern Overlay - Top Left */}
                        <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                            <div className="flex items-center gap-2">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-2 w-2 bg-[var(--text-primary)] rounded-full"></div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Trust Indicators */}
                <div className="mt-16 pt-12 border-t border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <p className="text-sm text-[var(--text-secondary)] mb-1">Expertise In</p>
                            <p className="font-bold text-[var(--card-text)]">Vastu Oils</p>
                        </div>
                        <div>
                            <p className="text-sm text-[var(--text-secondary)] mb-1">Expertise In</p>
                            <p className="font-bold text-[var(--card-text)]">Astrology Oils</p>
                        </div>
                        <div>
                            <p className="text-sm text-[var(--text-secondary)] mb-1">Expertise In</p>
                            <p className="font-bold text-[var(--card-text)]">Meditation Oils</p>
                        </div>
                        <div>
                            <p className="text-sm text-[var(--text-secondary)] mb-1">Expertise In</p>
                            <p className="font-bold text-[var(--card-text)]">Aroma Blends</p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
