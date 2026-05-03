
"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Leaf, Award, Heart, Sparkles, Users, BookOpen, Target, ArrowRight, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
export default function AboutUsPage() {
return (
<div className="min-h-screen bg-white">
        <Navbar />
            <section className="relative h-[60vh] md:h-[70vh] bg-gradient-to-br from-green-900 via-emerald-800 to-green-900 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                    backgroundSize: '30px 30px'
                }}></div>
            </div>

            {/* Decorative Leaves */}
            <div className="absolute top-20 right-20 text-green-300 opacity-20 rotate-12">
                <Leaf size={150} />
            </div>
            <div className="absolute bottom-20 left-20 text-green-300 opacity-20 -rotate-12">
                <Leaf size={100} />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 mb-6">
                            <Leaf className="h-8 w-8 text-green-300" />
                            <div className="h-px w-20 bg-gradient-to-r from-green-300 to-transparent"></div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
                            Our Journey of
                            <span className="block text-green-200">Vedic Excellence</span>
                        </h1>
                        <p className="text-lg md:text-xl text-green-50 leading-relaxed mb-8">
                            A leading brand in Vastu Shastra, Astrology, Numerology, Aura Scanning, and Aromatherapy.
                        </p>
                        <div className="flex items-center gap-2 text-green-200 text-sm">
                            <div className="h-px w-12 bg-green-300/50"></div>
                            <span className="font-light italic">Pure • Natural • Authentic</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Wave */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                    <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
                </svg>
            </div>
        </section>

        {/* About Us Section */}
        <section className="py-16 md:py-24 relative">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
                    
                    {/* Left Content */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-px w-12 bg-gradient-to-r from-[var(--text-primary)] to-transparent"></div>
                            <span className="text-sm font-bold text-[var(--text-primary)] tracking-wider uppercase">About Us</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-[var(--card-text)]">
                            A Legacy Rooted in Tradition
                        </h2>

                        <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
                            <p className="text-lg">
                                <span className="font-semibold text-[var(--card-text)]">Vedant Gurukul</span> is a leading brand offering services in Vastu Shastra, Astrology, Numerology, Aura scanning and Aromatherapy. The faculty includes highly qualified professionals like Aacharya Dr. Manish, who holds multiple advanced degrees including Ph.D.s in Astrological Sciences and Computer Science, and Ms. Anisha, an expert Vastu Consultant, Astrologer, Numerologist and clinical aromatherapist.
                            </p>
                            <p>
                                Vedant Gurukul also provides education and practical training in all these fields with hands-on lab experience and has a rich collection of books on Vedic sciences. Their services cover guidance and remedies based on Astrology, Vastu Shastra, Numerology, and the therapeutic use of Aromas.
                            </p>
                            <p>
                                The institute is well known and holds a top position in JustDial Lucknow for related services.
                            </p>
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="relative">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                            <div className="aspect-[4/5] relative bg-gradient-to-br from-green-100 to-amber-100">
                                <Image
                                    src="/images/vedic-tradition.jpg"
                                    alt="Vedic Tradition and Heritage"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                        <div className="absolute -bottom-8 -right-8 bg-gradient-to-br from-[var(--text-primary)] to-[var(--base-200)] rounded-3xl p-6 shadow-2xl max-w-[200px]">
                            <p className="text-4xl font-bold text-white mb-1">20+</p>
                            <p className="text-sm text-green-100">Years of Vedic Excellence</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Our Experts Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-green-50/50 to-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="flex justify-center items-center gap-3 mb-6">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--text-primary)]"></div>
                        <Users className="h-6 w-6 text-[var(--text-primary)]" />
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--text-primary)]"></div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-[var(--card-text)]">
                        Meet Our Experts
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Aacharya Dr. Manish */}
                    <div className="bg-white rounded-3xl p-8 shadow-lg border border-green-100 hover:shadow-2xl transition-all duration-300">
                        <h3 className="text-2xl font-serif font-bold text-[var(--card-text)] mb-4">Aacharya Dr. Manish</h3>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            A highly qualified professional with multiple advanced degrees, including Ph.D.s in Astrological Sciences and Computer Science.
                        </p>
                    </div>

                    {/* Ms. Anisha Saxena */}
                    <div className="bg-white rounded-3xl p-8 shadow-lg border border-green-100 hover:shadow-2xl transition-all duration-300">
                        <h3 className="text-2xl font-serif font-bold text-[var(--card-text)] mb-4">Ms. Anisha Saxena</h3>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            An expert Vastu Consultant, Astrologer, Numerologist, and clinical aromatherapist with twenty years of experience.
                        </p>
                    </div>
                </div>
            </div>
        </section>
        
        {/* Ms. Anisha's Services Section */}
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-[var(--card-text)] mb-4">
                        Expert Vastu & Astrology Services
                    </h2>
                    <p className="text-lg text-[var(--text-secondary)] max-w-3xl mx-auto">
                        Ms. Anisha Saxena, a professional Vastu Shastra consultant and expert Astrologer with twenty years of experience, offers a broad range of services aimed at harmonizing living and working spaces.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                        <h3 className="text-xl font-bold text-[var(--card-text)] mb-3">Site Evaluation and Analysis</h3>
                        <p className="text-[var(--text-secondary)]">
                            Assessing the plot or space for construction, including orientation, terrain, and surroundings to align with Vastu principles.
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                        <h3 className="text-xl font-bold text-[var(--card-text)] mb-3">Remedial Measures and Solutions</h3>
                        <p className="text-[var(--text-secondary)]">
                            Providing practical solutions and modifications, without structural changes or demolition, to correct any Vastu defects or imbalances in existing spaces.
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                        <h3 className="text-xl font-bold text-[var(--card-text)] mb-3">Energy Flow Improvement</h3>
                        <p className="text-[var(--text-secondary)]">
                            Suggesting adjustments that enhance the flow of positive energy for clients' health, happiness, and prosperity.
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                        <h3 className="text-xl font-bold text-[var(--card-text)] mb-3">Consultations for Specific Issues</h3>
                        <p className="text-[var(--text-secondary)]">
                            Offering targeted guidance to address personal, financial, or health-related concerns through Vastu-compliant changes.
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                        <h3 className="text-xl font-bold text-[var(--card-text)] mb-3">Specialized Consultations</h3>
                        <p className="text-[var(--text-secondary)]">
                            For homes, offices, factories, plots/lands, commercial spaces, and even spiritual or industrial Vastu.
                        </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                        <h3 className="text-xl font-bold text-[var(--card-text)] mb-3">Astro-Vastu Consultations</h3>
                        <p className="text-[var(--text-secondary)]">
                            Combining Astrology, Numerology, and Vastu for more precise and personalized recommendations.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-[var(--text-primary)] to-[var(--base-200)] text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full"></div>
                <div className="absolute bottom-10 right-10 w-32 h-32 border-4 border-white rounded-full"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <p className="text-5xl font-bold mb-2">20+</p>
                        <p className="text-green-100">Years of Experience</p>
                    </div>
                    <div>
                        <p className="text-5xl font-bold mb-2">5+</p>
                        <p className="text-green-100">Core Services</p>
                    </div>
                    <div>
                        <p className="text-5xl font-bold mb-2">5000+</p>
                        <p className="text-green-100">Happy Clients</p>
                    </div>
                    <div>
                        <p className="text-5xl font-bold mb-2">Top-Rated</p>
                        <p className="text-green-100">on JustDial</p>
                    </div>
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-br from-amber-50 via-green-50 to-emerald-100 rounded-3xl p-12 md:p-16 text-center border border-green-200 shadow-xl">
                    <Leaf className="h-12 w-12 text-[var(--text-primary)] mx-auto mb-6" />
                    <h2 className="text-3xl md:text-5xl font-serif font-bold text-[var(--card-text)] mb-6">
                        Harmonize Your Life and Space
                    </h2>
                    <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
                        Embrace the power of ancient Vedic sciences to bring balance, prosperity, and well-being into your life.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button
                            asChild
                            size="lg"
                            className="bg-[var(--text-primary)] text-white hover:bg-[var(--base-200)] h-14 px-10 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                            <Link href="/#contact" className="flex items-center gap-2">
                                Book a Consultation
                                <ArrowRight size={20} />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="border-2 border-[var(--text-primary)] text-[var(--text-primary)] hover:bg-green-50 h-14 px-10 rounded-full font-bold"
                        >
                            <Link href="/courses">
                                Explore Courses
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
        <Footer />
    </div>
);
}