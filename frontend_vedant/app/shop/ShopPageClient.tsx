// shop/ShopPageClient.tsx
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';

// --- Redux Imports ---
import { AppDispatch, RootState } from '@/lib/redux/store';
import { fetchProducts } from '@/lib/redux/slices/productSlice';
import { fetchCategories, fetchSubcategories } from '@/lib/redux/slices/adminSlice';

// --- Component Imports ---
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FiltersSidebar } from '@/components/FiltersSidebar';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import ProductGridSkeleton from '@/components/skeleton/ProductGridSkeleton';

const MAX_PRICE = 8000;

export default function ShopPageClient() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { items: products, loading, error, currentPage, totalPages, totalProducts } = useSelector((state: RootState) => state.product);
  const { categories, subcategories, categoryStatus, subcategoryStatus } = useSelector((state: RootState) => state.admin);

  // --- DYNAMICALLY GENERATED FILTERS ---
  const allFilterGroups = useMemo(() => {
    const dynamicFilters = [];

    // --- UPDATED: Added Type Filter ---
    dynamicFilters.push({
      id: 'type',
      label: 'Type',
      options: [
        { id: 'product', label: 'Product' },
        { id: 'service', label: 'Service' },
      ],
    });

    // --- Price Filter ---
    // dynamicFilters.push({
    //   id: 'price',
    //   label: 'Price Range',
    //   options: [], // No options needed for price range slider
    // });

    if (categories.length > 0) {
      dynamicFilters.push({
        id: 'category',
        label: 'Category',
        options: categories.map(cat => ({ id: cat.name, label: cat.name })),
      });
    }

    if (subcategories.length > 0) {
      dynamicFilters.push({
        id: 'sub_category',
        label: 'Sub-Category',
        isClothing: true,
        options: subcategories.map(subcat => ({ id: subcat.name, label: subcat.name })),
      });
    }

    return dynamicFilters;
  }, [categories, subcategories]);

  // --- STATE INITIALIZATION FROM URL ---
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(() => {
    const filters: Record<string, string[]> = {};
    searchParams.forEach((value, key) => {
      if (key !== 'page' && key !== 'minPrice' && key !== 'maxPrice') {
        filters[key] = value.split(',');
      }
    });
    return filters;
  });

  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>(() => {
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    return {
      min: minPrice ? Number(minPrice) : 0,
      max: maxPrice ? Number(maxPrice) : MAX_PRICE,
    };
  });

  // Smart filter logic (remains unchanged, but will work with new filters)
  const displayedFilterGroups = useMemo(() => {
    const selectedCategory = selectedFilters.category || [];
    if (selectedCategory.includes('Decorative') && !selectedCategory.includes('Clothing')) {
      return allFilterGroups.filter(group => !group.isClothing);
    }
    return allFilterGroups;
  }, [selectedFilters.category, allFilterGroups]);

  // --- DATA FETCHING & URL SYNC ---
  useEffect(() => {
    if (categoryStatus === 'idle') dispatch(fetchCategories());
    if (subcategoryStatus === 'idle') dispatch(fetchSubcategories());
  }, [categoryStatus, subcategoryStatus, dispatch]);

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    dispatch(fetchProducts(params));
  }, [searchParams, dispatch]);

  useEffect(() => {
    const params = new URLSearchParams();
    
    Object.entries(selectedFilters).forEach(([key, values]) => {
      if (values.length > 0) {
        params.set(key, values.join(','));
      }
    });

    if (priceRange.min > 0) {
      params.set('minPrice', String(priceRange.min));
    }
    if (priceRange.max < MAX_PRICE) {
      params.set('maxPrice', String(priceRange.max));
    }

    params.set('page', '1');
    
    router.replace(`${pathname}?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilters, priceRange, pathname, router]);

  // --- Filter Handlers ---
  const handleFilterChange = (groupId: string, optionId: string, checked: boolean) => {
    setSelectedFilters(prev => {
      const newGroupFilters = prev[groupId] ? [...prev[groupId]] : [];
      if (checked) {
        if (!newGroupFilters.includes(optionId)) newGroupFilters.push(optionId);
      } else {
        const index = newGroupFilters.indexOf(optionId);
        if (index > -1) newGroupFilters.splice(index, 1);
      }
      
      const updatedFilters = { ...prev, [groupId]: newGroupFilters };

      // --- This logic is specific to your clothing/decorative categories and can remain as is ---
      if (groupId === 'category') {
        allFilterGroups.forEach(group => {
          if (group.isClothing) delete updatedFilters[group.id];
        });
      }
      return updatedFilters;
    });
  };

  const handlePriceChange = (min: number, max: number) => {
    setPriceRange({ min, max });
  };

  const handleClearFilters = () => {
    setSelectedFilters({});
    setPriceRange({ min: 0, max: MAX_PRICE });
  };
  
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  }

  const mappedProducts = useMemo(() => 
    products
      .filter(p => p && p._id && p.name && p.slug)
      .map(p => ({
        _id: p._id!,
        name: p.name,
        slug: p.slug,
        images: p.images || [],
        tags: p.tags || [],
        price: p.sale_price ?? p.price ?? 0,
        base_price: p.sale_price ? p.price : undefined,
        originalProduct: p,
      })), 
    [products]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-100 rounded-2xl p-8 text-center mb-12">
          <h1 className="text-4xl font-serif font-bold">Shop Collection</h1>
          <p className="text-gray-600 mt-2">Discover our curated selection of clothing and decorative items.</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <FiltersSidebar 
            filters={displayedFilterGroups}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            priceRange={priceRange}
            onPriceChange={handlePriceChange}
            maxPrice={MAX_PRICE}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">Showing <span className='font-bold'>{products.length}</span> of <span className='font-bold'>{totalProducts}</span> products</p>
            </div>
            {loading && products.length === 0 ? (
              <ProductGridSkeleton count={9} />
            ) : error ? (
              <div className="text-center py-20 text-red-500">Failed to load products. Please try again.</div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-700 text-lg font-semibold">No products found</p>
                <p className="text-gray-500 mt-2">Try adjusting your filters.</p>
                <Button onClick={handleClearFilters} variant="link" className='mt-2'>Clear Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8">
                {mappedProducts.map(product => <ProductCard key={product._id} product={product} />)}
              </div>
            )}
            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) handlePageChange(currentPage - 1); }} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(i + 1); }} isActive={currentPage === i + 1}>{i + 1}</PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) handlePageChange(currentPage + 1); }} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}