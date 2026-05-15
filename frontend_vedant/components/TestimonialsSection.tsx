"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const testimonials = [
    {
        id: 1,
        name: "Priya Sharma",
        location: "Mumbai, Maharashtra",
        image: "/testimonials/user-1.jpg",
        rating: 5,
        text: "The aroma oils from Vedant Gurukul have become a beautiful part of my daily yoga practice. The quality and authenticity are unmatched."
    },
    {
        id: 2,
        name: "Rajesh Kumar",
        location: "Delhi, NCR",
        image: "/testimonials/user-2.jpg",
        rating: 5,
        text: "As a Vastu consultant, I recommend these oils to all my clients. The energy shift is remarkable and my clients have seen positive changes in their spaces."
    },
    {
        id: 3,
        name: "Anita Desai",
        location: "Bangalore, Karnataka",
        image: "/testimonials/user-3.jpg",
        rating: 5,
        text: "Pure, authentic aroma oils. The fragrance and quality speak for themselves. My family uses these oils during meditation and daily rituals."
    },
    {
        id: 4,
        name: "Vikram Patel",
        location: "Ahmedabad, Gujarat",
        image: "/testimonials/user-4.jpg",
        rating: 5,
        text: "I've been using Vedant Gurukul's astrology oils for my practice and the results have been phenomenal. Clients notice the difference immediately."
    },
    {
        id: 5,
        name: "Meera Iyer",
        location: "Chennai, Tamil Nadu",
        image: "/testimonials/user-5.jpg",
        rating: 5,
        text: "The traditional inspiration combined with modern quality standards makes these products exceptional. Highly recommend for anyone seeking authentic aroma blends."
    },
    {
        id: 6,
        name: "Arjun Singh",
        location: "Jaipur, Rajasthan",
        image: "/testimonials/user-6.jpg",
        rating: 5,
        text: "Outstanding quality and service. These aroma oils have become an essential part of my daily routine. Thank you Vedant Gurukul!"
    }
];

export function TestimonialsSection() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollToIndex = (index: number) => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const cardWidth = container.scrollWidth / testimonials.length;
            container.scrollTo({
                left: cardWidth * index,
                behavior: 'smooth'
            });
            setCurrentIndex(index);
        }
    };

    const handlePrevious = () => {
        const newIndex = currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1;
        scrollToIndex(newIndex);
        setIsAutoPlaying(false);
    };

    const handleNext = () => {
        const newIndex = currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1;
        scrollToIndex(newIndex);
        setIsAutoPlaying(false);
    };

    // Auto-scroll effect
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            const newIndex = currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1;
            scrollToIndex(newIndex);
        }, 4000);

        return () => clearInterval(interval);
    }, [currentIndex, isAutoPlaying]);

    // Handle scroll event to update current index
    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const cardWidth = container.scrollWidth / testimonials.length;
            const newIndex = Math.round(container.scrollLeft / cardWidth);
            if (newIndex !== currentIndex) {
                setCurrentIndex(newIndex);
            }
        }
    };

    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-green-50/50 via-white to-amber-50/30 relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-20 left-10 text-green-100 opacity-50">
                <Leaf size={100} className="rotate-12" />
            </div>
            <div className="absolute bottom-20 right-10 text-amber-100 opacity-50">
                <Leaf size={120} className="-rotate-12" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex justify-center items-center gap-3 mb-6">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--text-primary)]"></div>
                        <Leaf className="h-6 w-6 text-[var(--text-primary)]" />
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--text-primary)]"></div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-[var(--card-text)] mb-4">
                        What Our Customers Say
                    </h2>
                    <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
                        Discover the experiences of customers who use our authentic aroma oils and ritual blends
                    </p>
                </div>

                {/* Testimonials Carousel */}
                <div className="relative max-w-7xl mx-auto">
                    
                    {/* Navigation Buttons */}
                    <button
                        onClick={handlePrevious}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-white hover:bg-green-50 text-[var(--text-primary)] p-3 rounded-full shadow-xl border-2 border-green-100 transition-all duration-300 hover:scale-110 hidden md:block"
                        aria-label="Previous testimonial"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-white hover:bg-green-50 text-[var(--text-primary)] p-3 rounded-full shadow-xl border-2 border-green-100 transition-all duration-300 hover:scale-110 hidden md:block"
                        aria-label="Next testimonial"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Scrollable Container */}
                    <div 
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {testimonials.map((testimonial) => (
                            <div
                                key={testimonial.id}
                                className="flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-center"
                            >
                                <div className="bg-white rounded-3xl p-8 shadow-lg border border-green-100 hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                                    
                                    {/* Quote Icon */}
                                    <div className="mb-4">
                                        <Quote className="h-10 w-10 text-[var(--text-primary)] opacity-30" />
                                    </div>

                                    {/* Rating Stars */}
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>

                                    {/* Testimonial Text */}
                                    <p className="text-[var(--text-secondary)] leading-relaxed mb-6 flex-grow">
                                        "{testimonial.text}"
                                    </p>

                                    {/* Divider */}
                                    <div className="h-px bg-gradient-to-r from-[var(--text-primary)]/20 via-[var(--text-primary)]/40 to-[var(--text-primary)]/20 mb-6"></div>

                                    {/* Customer Info */}
                                    <div className="flex items-center gap-4">
                                        <div className="relative h-14 w-14 rounded-full overflow-hidden bg-gradient-to-br from-[var(--text-primary)] to-[var(--base-200)] flex-shrink-0">
                                            {/* Placeholder avatar with initials */}
                                            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
                                                {testimonial.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-bold text-[var(--card-text)]">{testimonial.name}</p>
                                            <p className="text-sm text-[var(--text-secondary)]">{testimonial.location}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Mobile Navigation Buttons */}
                    <div className="flex justify-center gap-4 mt-8 md:hidden">
                        <Button
                            onClick={handlePrevious}
                            variant="outline"
                            size="icon"
                            className="rounded-full border-2 border-[var(--text-primary)] text-[var(--text-primary)] hover:bg-green-50"
                        >
                            <ChevronLeft size={20} />
                        </Button>
                        <Button
                            onClick={handleNext}
                            variant="outline"
                            size="icon"
                            className="rounded-full border-2 border-[var(--text-primary)] text-[var(--text-primary)] hover:bg-green-50"
                        >
                            <ChevronRight size={20} />
                        </Button>
                    </div>

                    {/* Dots Indicator */}
                    <div className="flex justify-center gap-2 mt-8">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    scrollToIndex(index);
                                    setIsAutoPlaying(false);
                                }}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    index === currentIndex 
                                        ? 'bg-[var(--text-primary)] w-8' 
                                        : 'bg-gray-300 w-2 hover:bg-gray-400'
                                }`}
                                aria-label={`Go to testimonial ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

            </div>

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
}
