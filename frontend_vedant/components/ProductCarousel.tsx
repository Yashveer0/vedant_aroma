// components/ProductCarousel.tsx
"use client"
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/data";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useRef } from "react";
import { Button } from "./ui/button";

interface ProductCarouselProps {
  products: Product[];
  collectionLink: string;
}

export function ProductCarousel({ products, collectionLink }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300; // Adjust scroll amount as needed
      if (direction === "left") {
        scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex space-x-6 overflow-x-auto scrollbar-hide py-4 -my-4" // Added padding and negative margin to make room for scrollbar
      >
        {products.map((product, index) => (
          <div key={product.id} className="min-w-[280px] sm:min-w-[300px] lg:min-w-[320px]">
            <ProductCard product={product} index={index} />
          </div>
        ))}
      </div>
      {products.length > 4 && ( // Only show arrows if there are more than 4 products (or adjust based on desired visible items)
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full shadow-md z-10 hover:bg-white"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full shadow-md z-10 hover:bg-white"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6 text-gray-700" />
          </Button>
        </>
      )}
    </div>
  );
}