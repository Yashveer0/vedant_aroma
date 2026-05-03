"use client";

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/redux/store';
import { fetchProducts } from '@/lib/redux/slices/productSlice';
import { Product } from '@/lib/types/product';
import ProductCard from '@/components/ProductCard';
import { Loader2, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  className?: string;
  queryParams: {
    type?: string;
    limit?: number;
    category?: string;
    tags?: string;
    gender?: string;
  };
}

export function ProductSection({ title, subtitle, queryParams, className }: ProductSectionProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchProducts(queryParams))
      .unwrap()
      .then((data) => {
        setProducts(data.products || []);
      })
      .catch((err) => {
        setError(err?.message || `Failed to fetch products.`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch, JSON.stringify(queryParams)]);

  const mappedProducts = products.map(p => ({
    base_price: p.price,
    price: p.sale_price ?? p.price,
    _id: p._id,
    name: p.name,
    slug: p.slug,
    images: p.images,
    tags: p.tags,
    originalProduct: p 
  }));

  const createViewAllLink = () => {
    if (queryParams.category) {
      return `/shop?category=${encodeURIComponent(queryParams.category)}`;
    }
    if (queryParams.tags) {
      return `/shop?tags=${encodeURIComponent(queryParams.tags)}`;
    }
    return '/shop';
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--text-primary)]" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-600 p-10 bg-red-50 rounded-xl border border-red-200">
          <p className="font-medium">{error}</p>
        </div>
      );
    }

    if (mappedProducts.length === 0) {
      return (
        <div className="text-center text-[var(--text-secondary)] p-10 bg-white rounded-xl border border-gray-200">
          <Leaf className="h-12 w-12 mx-auto mb-4 text-[var(--text-primary)] opacity-50" />
          <p className="font-medium">No products found in this collection.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
        {mappedProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))} 
      </div>
    );
  };

  return (
    <section className={`py-16 md:py-24 bg-gradient-to-b from-green-50/50 via-white to-green-50/30 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Decorative leaf accent */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--text-primary)]"></div>
            <Leaf className="h-6 w-6 text-[var(--text-primary)]" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--text-primary)]"></div>
          </div>
        </div>

        {/* Header with natural typography */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-[var(--card-text)] mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-base md:text-lg max-w-2xl mx-auto text-[var(--text-secondary)] leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {renderContent()}

        {/* {!loading && !error && mappedProducts.length > 0 && (
          <div className="mt-16 text-center">
            <Button 
              asChild 
              size="lg" 
              className="bg-[var(--text-primary)] text-white hover:bg-[var(--base-200)] h-12 px-10 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Link href={createViewAllLink()}>
                <Leaf className="mr-2 h-5 w-5" />
                Explore All {title}
              </Link>
            </Button>
          </div>
        )} */}
      </div>
    </section>
  );
}