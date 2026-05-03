"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sparkles, Leaf, ArrowRight } from 'lucide-react';

export function PromoBanner() {
    return (
        <section className="my-12 md:my-20 mx-4 md:mx-6 lg:mx-8">
            <div className="relative bg-gradient-to-br from-amber-50 via-green-50 to-emerald-100 rounded-3xl overflow-hidden shadow-xl border border-green-200">
                
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-5">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <circle cx="20" cy="20" r="1" fill="currentColor" className="text-green-600"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                {/* Decorative leaf elements */}
                <div className="absolute top-10 right-20 text-green-200 opacity-20 rotate-12">
                    <Leaf size={120} />
                </div>
                <div className="absolute bottom-10 left-20 text-amber-200 opacity-20 -rotate-12">
                    <Leaf size={80} />
                </div>

                <div className="relative grid md:grid-cols-2 gap-8 items-center">
                    
                    {/* Left Content Section */}
                    <div className="p-8 md:p-12 lg:p-16 space-y-6">
                        
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--text-primary)] to-[var(--base-200)] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                            <Sparkles size={16} className="animate-pulse" />
                            <span>Featured Collection</span>
                        </div>

                        {/* Heading */}
                        <div className="space-y-3">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[var(--card-text)] leading-tight">
                                Pure Healing
                                <span className="block text-[var(--text-primary)]">
                                    Oils Collection
                                </span>
                            </h2>
                            
                            {/* Decorative divider */}
                            <div className="flex items-center gap-3 pt-2">
                                <div className="h-1 w-16 bg-gradient-to-r from-[var(--text-primary)] to-transparent rounded-full"></div>
                                <Leaf className="h-5 w-5 text-[var(--text-primary)]" />
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-lg">
                            Experience the ancient wisdom of Ayurveda with our carefully crafted healing oils. Each blend is formulated using traditional Vedic knowledge to promote balance, wellness, and inner peace.
                        </p>

                        {/* Features List */}
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="h-2 w-2 bg-[var(--text-primary)] rounded-full"></div>
                                <span className="text-[var(--card-text)] font-medium">100% Natural</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="h-2 w-2 bg-[var(--text-primary)] rounded-full"></div>
                                <span className="text-[var(--card-text)] font-medium">Vedic Formulas</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="h-2 w-2 bg-[var(--text-primary)] rounded-full"></div>
                                <span className="text-[var(--card-text)] font-medium">Handcrafted</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="h-2 w-2 bg-[var(--text-primary)] rounded-full"></div>
                                <span className="text-[var(--card-text)] font-medium">Premium Quality</span>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4 pt-6">
                            <Button 
                                asChild 
                                size="lg"
                                className="bg-[var(--text-primary)] text-white hover:bg-[var(--base-200)] h-12 px-8 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                <Link href="/shop" className="flex items-center gap-2">
                                    Shop Collection
                                    <ArrowRight size={18} />
                                </Link>
                            </Button>
                            <Button 
                                asChild 
                                variant="outline"
                                size="lg"
                                className="border-2 border-[var(--text-primary)] text-[var(--text-primary)] hover:bg-green-50 h-12 px-8 rounded-full font-bold transition-all duration-300"
                            >
                                <Link href="/about-us">
                                    Learn More
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Right Image Section */}
                    <div className="relative h-full min-h-[400px] md:min-h-[500px]">
                        
                        {/* Main Product Image */}
                        <div className="absolute inset-0 flex items-center justify-center p-8">
                            <div className="relative w-full h-full max-w-md">
                                {/* Glow effect behind image */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--text-primary)]/20 to-[var(--base-200)]/20 rounded-full blur-3xl"></div>
                                
                                {/* Product Image - Replace with your actual product image */}
                                <Image
                                    src="/promopng.png"
                                    alt="Healing Oils Collection"
                                    fill
                                    className="object-contain drop-shadow-2xl relative z-10"
                                />
                            </div>
                        </div>

                        {/* Floating info cards */}
                        <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-xl border border-green-100 z-20">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-[var(--text-primary)]">25+</p>
                                <p className="text-xs font-semibold text-[var(--text-secondary)]">Products</p>
                            </div>
                        </div>

                        <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-xl border border-green-100 z-20">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gradient-to-br from-[var(--text-primary)] to-[var(--base-200)] rounded-full flex items-center justify-center">
                                    <Leaf className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-[var(--text-secondary)]">Certified</p>
                                    <p className="text-sm font-bold text-[var(--card-text)]">Organic</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Bottom decorative wave */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--text-primary)] via-[var(--base-200)] to-[var(--text-primary)]"></div>
            </div>
        </section>
    );
}