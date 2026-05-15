"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import HomePageSkeleton from "@/components/skeleton/HomePageSkeleton";
import { ProductSection } from "@/components/home/ProductSection";
import { CategoryScroller } from "@/components/home/CategoryScroller";
import { PromoBanner } from "@/components/home/PromoBanner";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { ContactForm } from "@/components/home/ContactForm";
import HeroSlider from "@/components/home/HeroSlider";
import { AboutSection } from "@/components/home/AboutSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { WhyChooseUsSection } from "@/components/home/WhyChooseUsSection";
import { Testimonials } from "@/components/home/Testimonials";
import { VedicReels } from "@/components/home/VedicReels";
import { BlogSection } from "@/components/BlogsSection";

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect is now only for the initial page skeleton.
    // Each ProductSection can handle its own loading state.
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <Header />
        <HomePageSkeleton />
      </>
    );
  }

  return (
    <div className="bg-[var(--base-50)]/30">
      <Navbar />
      <Header />

        <CategoryScroller />

      <HeroSlider />


      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        
      <Testimonials />
        
        {/* General section, good for any store */}
        <ProductSection
          title="Trending Products"
          queryParams={{ tags: "trend",limit: 4 }}
        />
        <VedicReels />

        <WhyChooseUsSection />

        {/* Thematic section based on your categories */}
        <ProductSection
          title="Sacred Vastu Oils"
          queryParams={{ category: "Vastu Correction Oils", limit: 4 }}
        />

        <PromoBanner />
        <AboutSection />
        
        {/* Thematic section based on your categories */}
        <ProductSection
            title="Yoga & Meditation Oils"
            queryParams={{ category: "Yoga & Healing Oils", limit: 4 }}
        />

        {/* Blogs section */}
        <BlogSection 
         title="Explore Our Latest Blogs"
        //  subtitle="Discover the power of traditional Aroma Blends in sacred rituals and modern wellness"
         filterParams={{ limit: 6}}
         className="my-16 md:my-24"
         />
        
        {/* General section, good for highlighting specific items */}
        <ProductSection
          title="Featured Products"
          queryParams={{ tags: "featured", limit: 4 }}
        />
        
        <FeaturesSection />
        <TestimonialsSection />

        <div id="contact">
          <ContactForm />
        </div>

      </main>
    </div>
  );
};

export default HomePage;
