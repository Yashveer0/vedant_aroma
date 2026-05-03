// components/RecommendedProducts.tsx (Updated)

"use client";

import React, { useEffect, useState } from "react";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay'; 
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { fetchProducts } from "@/lib/redux/slices/productSlice";
import { Product } from "@/lib/types/product";
import { SmallCard } from "./SmallCard";

interface RecommendedProductsProps {
  currentProduct: Product; // Pass the currently viewed product
}

export function RecommendedProducts({ currentProduct }: RecommendedProductsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { items: allProducts, loading: productsLoading } = useSelector((state: RootState) => state.product);
  const [recommended, setRecommended] = useState<Product[]>([]);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 5000 })]);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  useEffect(() => {
    // Fetch a larger pool of products to recommend from
    if (allProducts.length < 20) {
        dispatch(fetchProducts({ limit: 50 }));
    }
  }, [dispatch, allProducts.length]);

  useEffect(() => {
    if (!currentProduct || allProducts.length === 0) {
      setRecommended([]);
      return;
    }

    // Products available for recommendation (excluding the current one)
    const availableProducts = allProducts.filter(p => p._id !== currentProduct._id);
    
    // Features of the current product to find similar items
    const currentFeatures = {
      category: currentProduct.category,
      brand: currentProduct.brand,
      gender: currentProduct.gender,
      fit: currentProduct.fit,
      tags: new Set(currentProduct.tags || [])
    };

    const scoredProducts = availableProducts.map(product => {
      let score = 0;
      // High score for same category
      if (product.category === currentFeatures.category) score += 5;
      // Medium score for same brand
      if (product.brand === currentFeatures.brand) score += 3;
      // Score for gender match
      if (product.gender && product.gender === currentFeatures.gender) score += 2;
      // Score for fit match (for clothing)
      if (product.fit && product.fit === currentFeatures.fit) score += 1;
      
      // Score for common tags
      if (product.tags && currentFeatures.tags.size > 0) {
        const commonTags = product.tags.filter(tag => currentFeatures.tags.has(tag));
        score += commonTags.length * 2; // High score for each common tag
      }
      
      return { ...product, score };
    });

    // Sort by score (highest first), then by creation date (newest first)
    scoredProducts.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Take the top 10 recommendations
    setRecommended(scoredProducts.slice(0, 10));

  }, [currentProduct, allProducts]);

  if (productsLoading && recommended.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => <div key={i} className="aspect-[3/4] bg-gray-200 rounded-lg animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  if (recommended.length === 0) {
    return null; // Don't show the section if there's nothing to recommend
  }

  return (
    <div className="container mx-auto px-4 py-12 border-t">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif font-bold">You Might Also Like</h2>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={scrollPrev} aria-label="Previous"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={scrollNext} aria-label="Next"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {recommended.map(product => (
            <div key={product._id} className="flex-grow-0 flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 pl-4">
              <SmallCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}