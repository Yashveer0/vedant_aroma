// src/app/decorative/DecorativePageClient.tsx
"use client"

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

// --- Redux Imports ---
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import { fetchProducts } from '@/lib/redux/slices/productSlice';

// --- Component Imports ---
import ProductCard from '@/components/ProductCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DecorFiltersSidebar } from '@/components/DecorFiltersSidebar'; // Assuming this is your sidebar
import ProductGridSkeleton from '@/components/skeleton/ProductGridSkeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

// Define the structure for filter groups
const decorFilterGroups = [
    {
        id: 'sub_category',
        label: 'Category',
        options: [
            { id: 'Vases', label: 'Vases' },
            { id: 'Wall Paintings', label: 'Wall Paintings' },
            { id: 'Lamps & Lighting', label: 'Lamps & Lighting' },
            { id: 'Sculptures', label: 'Sculptures' },
            { id: 'Rugs & Carpets', label: 'Rugs & Carpets' },
        ],
    },
    {
        id: 'brand',
        label: 'Brand',
        options: [
            { id: 'Artisan Home', label: 'Artisan Home' },
            { id: 'Modern Canvas', label: 'Modern Canvas' },
            { id: 'Lumina', label: 'Lumina' },
        ],
    },
    {
        id: 'tags',
        label: 'Tags',
        options: [
            { id: 'New', label: 'New' },
            { id: 'Sale', label: 'Sale' },
        ],
    },
];

export default function DecorativePageClient() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // --- Redux State ---
    const { 
        items: products, 
        loading, 
        error,
        currentPage,
        totalPages,
        totalProducts
    } = useSelector((state: RootState) => state.product);

    // --- Local State for UI Control ---
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
    const [sortOption, setSortOption] = useState('newest');

    // --- useEffect Hooks for Data Fetching and URL Sync (Infinite Loop Fix) ---

    // HOOK 1: Fetches data whenever the URL (searchParams) changes.
    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        // Hamesha 'Decorative' category ke products fetch karo
        params.set('category', 'Decorative'); 
        
        dispatch(fetchProducts(Object.fromEntries(params)));
    }, [searchParams, dispatch]);

    // HOOK 2: Updates the URL whenever the user changes filters or sorting.
    useEffect(() => {
        const params = new URLSearchParams();
        Object.entries(selectedFilters).forEach(([key, values]) => {
            if (values.length > 0) {
                params.set(key, values.join(','));
            }
        });
        params.set('sort', sortOption);
        params.set('page', '1'); // Filter ya sort change karne par page 1 par jao
        
        router.replace(`${pathname}?${params.toString()}`);
    }, [selectedFilters, sortOption, pathname, router]);


    // --- Handlers ---
    const handleFilterChange = (groupId: string, optionId: string, checked: boolean) => {
        setSelectedFilters(prev => {
            const newGroup = prev[groupId] ? [...prev[groupId]] : [];
            if (checked) {
                if (!newGroup.includes(optionId)) newGroup.push(optionId);
            } else {
                const index = newGroup.indexOf(optionId);
                if (index > -1) newGroup.splice(index, 1);
            }
            return { ...prev, [groupId]: newGroup };
        });
    };

    const handleClearFilters = () => {
        setSelectedFilters({});
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        router.push(`${pathname}?${params.toString()}`);
    }

    // Map data for ProductCard
    const mappedProducts = useMemo(() => products.map(p => ({
        _id: p._id,
        name: p.name,
        slug: p.slug,
        images: p.images,
        tags: p.tags,
        price: p.sale_price ?? p.price,
        base_price: p.sale_price ? p.price : undefined,
        originalProduct: p,
    })), [products]);

    return (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Page Header */}
            <div className="bg-gray-50 rounded-2xl p-8 text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-serif text-gray-800">
                    Home Decor Collection
                </h1>
                <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
                    Find the perfect pieces to style your space, from elegant vases to stunning wall art.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                <DecorFiltersSidebar
                    filters={decorFilterGroups}
                    selectedFilters={selectedFilters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                />
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-semibold">{products.length}</span> of <span className="font-semibold">{totalProducts}</span> results
                        </p>
                        <Select value={sortOption} onValueChange={setSortOption}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest</SelectItem>
                                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* --- Product Grid with Loading/Error/Empty States --- */}
                    {loading && products.length === 0 ? (
                        <ProductGridSkeleton count={6} />
                    ) : error ? (
                        <div className="text-center py-20 text-red-500">Failed to load products. Please try again.</div>
                    ) : mappedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                            {mappedProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed rounded-lg">
                            <h3 className="text-xl font-semibold text-gray-700">No products found</h3>
                            <p className="mt-2 text-gray-500">Try adjusting your filters to find what you're looking for.</p>
                            <Button onClick={handleClearFilters} className="mt-4">Clear Filters</Button>
                        </div>
                    )}

                    {/* --- Pagination --- */}
                    {totalPages > 1 && !loading && (
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
    );
}