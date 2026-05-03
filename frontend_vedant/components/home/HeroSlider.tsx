"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Leaf } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

const slides = [
    {
        image: '/images/slider-1.jpg',
        title: "A Legacy of Vedic Wisdom",
        subtitle: "Vedant Gurukul started its journey in 2019, extending Vedic services to train professionals in Astrology, Vastu, Yoga, and Ayurveda. We now bring you the authentic Aroma Blends used in these sacred domains.",
        buttonText: "Our Story",
        buttonLink: "/about-us"
    },
    {
        image: '/images/slider-2.jpg',
        title: "Harmonize Your Space",
        subtitle: "Bring balance and positive energy to your surroundings with our powerful Vastu Correction and Astrology Oils.",
        buttonText: "Vastu Collection",
        buttonLink: "/shop?category=Vastu+Correction+Oils"
    },
    {
        image: '/images/slider-3.jpg',
        title: "Wellness for Mind, Body & Soul",
        subtitle: "Elevate your daily practice and find inner peace with our specially formulated Yoga & Healing Oils.",
        buttonText: "Healing Oils",
        buttonLink: "/shop?category=Yoga+%26+Healing+Oils"
    },
    {
        image: '/images/slider-4.jpg',
        title: "The Essence of Ayurveda",
        subtitle: "Discover the potent, pure, and time-tested formulations of our Aroma Medicines and Aark Ayurveda collections.",
        buttonText: "Ayurveda Collection",
        buttonLink: "/shop?category=Aark+Ayurveda"
    },
    {
        image: '/images/slider-5.jpg',
        title: "Explore Our Curated Collections",
        subtitle: "Handcrafted blends for a balanced, spiritual, and holistic life. Find the perfect product for your needs.",
        buttonText: "Shop All",
        buttonLink: "/shop"
    }
];

const sliderVariants = {
    incoming: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
        scale: 1.1,
        opacity: 0
    }),
    active: {
        x: 0,
        scale: 1,
        opacity: 1,
        transition: { duration: 0.8, ease: "easeOut" } 
    },
    exit: (direction: number) => ({
        x: direction < 0 ? '100%' : '-100%',
        scale: 1,
        opacity: 0,
        transition: { duration: 0.6, ease: "easeIn" } 
    })
};

const HeroSlider = () => {
    const [[slide, direction], setSlide] = useState([0, 0]);

    const nextSlide = () => {
        setSlide(prev => [prev[0] === slides.length - 1 ? 0 : prev[0] + 1, 1]);
    };

    const prevSlide = () => {
        setSlide(prev => [prev[0] === 0 ? slides.length - 1 : prev[0] - 1, -1]);
    };
    
    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-[65vh] md:h-[90vh] overflow-hidden bg-gradient-to-b from-green-900 to-amber-900">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={slide}
                    custom={direction}
                    variants={sliderVariants}
                    initial="incoming"
                    animate="active"
                    exit="exit"
                    className="absolute inset-0 w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${slides[slide].image})` }}
                >
                    {/* Gradient overlay for better text readability with earthy tones */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-900/70 via-green-900/50 to-transparent" />

                    {/* Text Content with natural, organic feel */}
                    <div className="relative z-10 flex flex-col items-start justify-center h-full text-white px-6 md:px-16 lg:px-24 max-w-7xl">
                        {/* Decorative leaf accent */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="flex items-center gap-3 mb-6"
                        >
                            <Leaf className="h-8 w-8 text-green-300" />
                            <div className="h-px w-20 bg-gradient-to-r from-green-300 to-transparent"></div>
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
                            className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold mb-6 max-w-3xl leading-tight"
                        >
                            {slides[slide].title}
                        </motion.h1>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
                            className="max-w-xl text-base md:text-lg lg:text-xl font-light mb-8 leading-relaxed text-green-50"
                        >
                            {slides[slide].subtitle}
                        </motion.p>
                        
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.7, ease: "easeOut" }}
                        >
                            <Button 
                                asChild 
                                size="lg" 
                                className="bg-white text-[var(--text-primary)] hover:bg-green-50 px-8 py-6 text-base md:text-lg rounded-full font-semibold shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-green-300"
                            >
                                <Link href={slides[slide].buttonLink} className="flex items-center gap-2">
                                    <Leaf size={20} />
                                    {slides[slide].buttonText}
                                </Link>
                            </Button>
                        </motion.div>

                        {/* Decorative element */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9, duration: 0.8 }}
                            className="mt-8 flex items-center gap-2 text-green-200 text-sm"
                        >
                            <div className="h-px w-12 bg-green-300/50"></div>
                            <span className="font-light italic">Pure • Natural • Authentic</span>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows with organic styling */}
            <div className="absolute z-20 top-1/2 -translate-y-1/2 w-full flex justify-between px-4 md:px-8">
                <button 
                    onClick={prevSlide} 
                    className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-300 border border-white/30 hover:scale-110" 
                    aria-label="Previous Slide"
                >
                    <ChevronLeft size={28} />
                </button>
                <button 
                    onClick={nextSlide} 
                    className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-300 border border-white/30 hover:scale-110" 
                    aria-label="Next Slide"
                >
                    <ChevronRight size={28} />
                </button>
            </div>

            {/* Navigation Dots with earthy aesthetic */}
            <div className="absolute z-20 bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setSlide([index, index > slide ? 1 : -1])}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`h-3 rounded-full transition-all duration-300 ${
                            slide === index 
                                ? 'bg-white w-12' 
                                : 'bg-white/50 hover:bg-white/75 w-3'
                        }`}
                    />
                ))}
            </div>

            {/* Decorative corner accent */}
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-green-600/10 to-transparent pointer-events-none"></div>
        </div>
    );
};

export default HeroSlider;