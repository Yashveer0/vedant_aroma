"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Frown } from "lucide-react"

// --- Next.js Navigation Hooks ---
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

// --- Redux Imports ---
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/lib/redux/store"
import { fetchProducts } from "@/lib/redux/slices/productSlice"

// --- Component Imports ---
import ProductCard from "@/components/ProductCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ProductGridSkeleton from "@/components/skeleton/ProductGridSkeleton"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// --- Offerings Header Component (Updated for Vedant Gurukul) ---
const OfferingsHeader = () => (
    <div className="relative h-[300px] md:h-[400px] w-full bg-gray-200">
        <Image
            src="/images/best-seller.jpg"
            alt="Vedant Gurukul Offerings Banner"
            fill
            className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
            <h1 className="text-4xl md:text-5xl font-serif font-bold">A Legacy Rooted in Tradition</h1>
            <p className="mt-4 max-w-3xl text-sm md:text-base">
                As a bridge between ancient wisdom and modern wellness, we offer meticulously crafted Aroma Blends and Vedic services that honor traditional formulations while meeting contemporary quality standards.
            </p>
        </div>
    </div>
);

export default function OfferingsPageClient() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Get data and pagination info from Redux
    const { 
        items: products, 
        loading, 
        error, 
        currentPage, 
        totalPages 
    } = useSelector((state: RootState) => state.product);

    // Local state for UI control
    const [sortOption, setSortOption] = useState('featured');
    const [typeFilter, setTypeFilter] = useState('all');

    // Data Fetching Effect (depends on typeFilter and page number)
    useEffect(() => {
        const page = searchParams.get('page') || '1';
        // The query parameters sent to the API
        const queryParams: { [key: string]: string } = {
            page: page,
        };
        
        // Add the 'type' filter if it's not 'all'
        if (typeFilter !== 'all') {
            queryParams.type = typeFilter; 
        }

        dispatch(fetchProducts(queryParams));
    }, [dispatch, typeFilter, searchParams]); // Depends on typeFilter and URL search params

    // Client-side sorting
    const sortedProducts = useMemo(() => {
        const sorted = [...products];
        switch (sortOption) {
            case 'price-asc':
                sorted.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price));
                break;
            case 'price-desc':
                sorted.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price));
                break;
            case 'newest':
                sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            default: // 'featured'
                // Add featured logic here if available, otherwise no-op
                break;
        }
        return sorted;
    }, [sortOption, products]);
    
    // Map data for the ProductCard component
    const mappedProducts = useMemo(() => sortedProducts.map(p => ({
        _id: p._id,
        name: p.name,
        slug: p.slug,
        images: p.images,
        tags: p.tags,
        price: p.sale_price ?? p.price,
        base_price: p.sale_price ? p.price : undefined,
        originalProduct: p,
    })), [sortedProducts]);

    // Function to handle page changes
    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <>
            <OfferingsHeader />

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {/* --- Filter & Toolbar --- */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-4 border-b">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">Filter by Type:</span>
                        <div className="flex gap-1 bg-gray-100 p-1 rounded-full">
                            <button onClick={() => setTypeFilter('all')} className={`px-4 py-1.5 text-sm rounded-full transition-colors ${typeFilter === 'all' ? 'bg-white shadow-sm text-black font-semibold' : 'text-gray-600'}`}>All</button>
                            <button onClick={() => setTypeFilter('product')} className={`px-4 py-1.5 text-sm rounded-full transition-colors ${typeFilter === 'product' ? 'bg-white shadow-sm text-black font-semibold' : 'text-gray-600'}`}>Products</button>
                            <button onClick={() => setTypeFilter('service')} className={`px-4 py-1.5 text-sm rounded-full transition-colors ${typeFilter === 'service' ? 'bg-white shadow-sm text-black font-semibold' : 'text-gray-600'}`}>Services</button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">Sort By:</span>
                        <Select value={sortOption} onValueChange={setSortOption}>
                            <SelectTrigger className="w-[160px] h-9 text-sm">
                                <SelectValue placeholder="Sorting" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="featured">Featured</SelectItem>
                                <SelectItem value="newest">Newest</SelectItem>
                                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* --- Product Grid & States --- */}
                <div className="product-grid-container min-h-[400px]">
                    {loading ? (
                        <ProductGridSkeleton count={8} />
                    ) : error ? (
                        <div className="text-center py-20 text-red-500">Failed to load our offerings. Please try again later.</div>
                    ) : mappedProducts.length > 0 ? (
                        <motion.div
                            layout
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8"
                        >
                            {mappedProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </motion.div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed rounded-2xl">
                            <Frown className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-semibold">No Offerings Found</h3>
                            <p className="mt-1 text-sm text-gray-500">Please try adjusting your filters or check back later!</p>
                        </div>
                    )}
                </div>

                {/* --- PAGINATION UI --- */}
                {!loading && totalPages > 1 && (
                    <div className="mt-12">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious 
                                        href="#" 
                                        onClick={(e) => { e.preventDefault(); if (currentPage > 1) handlePageChange(currentPage - 1); }}
                                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                                
                                {[...Array(totalPages)].map((_, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink 
                                            href="#" 
                                            onClick={(e) => { e.preventDefault(); handlePageChange(i + 1); }}
                                            isActive={currentPage === i + 1}
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext 
                                        href="#" 
                                        onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) handlePageChange(currentPage + 1); }}
                                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </main>
        </>
    )
}