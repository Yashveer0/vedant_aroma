"use client" 

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Frown } from "lucide-react"

// --- Next.js & Redux Hooks ---
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/lib/redux/store"
import { fetchProducts } from "@/lib/redux/slices/productSlice"

// --- Component Imports ---
import ProductCard from "@/components/ProductCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ProductGridSkeleton from "@/components/skeleton/ProductGridSkeleton"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// --- Header Component for New Arrivals ---
const CollectionHeader = () => (
    <div className="relative h-[200px] md:h-[300px] w-full bg-gray-200">
        <Image
            src="/images/new-arrivals.jpg"
            alt="New Arrivals Banner"
            fill
            className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
            <h1 className="text-4xl md:text-5xl font-serif font-bold">New Arrivals</h1>
            <p className="mt-2 text-xs md:text-sm">Explore the latest additions to our collection.</p>
        </div>
    </div>
);

// --- Main Client Component for the New Arrivals Page ---
export default function NewArrivalsPageClient() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Redux store se data lein
    const { 
        items: newArrivalProducts, 
        loading, 
        error, 
        currentPage, 
        totalPages 
    } = useSelector((state: RootState) => state.product);

    // Local state for UI controls (sorting and type filtering)
    const [sortOption, setSortOption] = useState('newest');
    // **FIXED**: State ka naam 'typeFilter' kar diya gaya hai
    const [typeFilter, setTypeFilter] = useState('all');

    // Data fetch karne ke liye effect
    useEffect(() => {
        const page = searchParams.get('page') || '1';
        
        // **FIXED**: Query ab 'type' parameter bhejegi
        const queryParams: { page: string, type?: string, sort: string } = {
            page: page,
            sort: 'newest'
        };
        
        // Agar 'all' ke alawa kuch select kiya hai, to use query mein add karein
        if (typeFilter !== 'all') {
            queryParams.type = typeFilter; 
        }

        dispatch(fetchProducts(queryParams));
    }, [dispatch, typeFilter, searchParams]); // Yeh effect typeFilter par depend karta hai

    // Filter badalne ke liye handler
    const handleFilterChange = (type: string) => {
        setTypeFilter(type);
        
        // Jab bhi filter badle, page ko 1 par reset kar dein
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`);
    };

    // Client-side sorting
    const sortedProducts = useMemo(() => {
        const sorted = [...newArrivalProducts];
        // Sorting logic mein koi badlaav nahi
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
            default:
                break;
        }
        return sorted;
    }, [sortOption, newArrivalProducts]);

    // ProductCard ke liye data map karna
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

    // Page change handler
    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <>
            <CollectionHeader />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {/* --- Filter & Toolbar --- */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-4 border-b">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">Filter by Type:</span>
                        {/* **FIXED**: Buttons ab 'product' aur 'service' ke liye hain */}
                        <div className="flex gap-1 bg-gray-100 p-1 rounded-full">
                            <button onClick={() => handleFilterChange('all')} className={`px-4 py-1.5 text-sm rounded-full transition-colors ${typeFilter === 'all' ? 'bg-white shadow-sm text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}>All</button>
                            <button onClick={() => handleFilterChange('product')} className={`px-4 py-1.5 text-sm rounded-full transition-colors ${typeFilter === 'product' ? 'bg-white shadow-sm text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}>Products</button>
                            <button onClick={() => handleFilterChange('service')} className={`px-4 py-1.5 text-sm rounded-full transition-colors ${typeFilter === 'service' ? 'bg-white shadow-sm text-gray-900 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}>Services</button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">Sort By:</span>
                        <Select value={sortOption} onValueChange={setSortOption}>
                            <SelectTrigger className="w-[160px] h-9 text-sm">
                                <SelectValue placeholder="Sorting" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest</SelectItem>
                                <SelectItem value="featured">Featured</SelectItem>
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
                        <div className="text-center py-20 text-red-500">Failed to load new arrivals. Please try again.</div>
                    ) : mappedProducts.length > 0 ? (
                        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                            {mappedProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </motion.div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed rounded-2xl">
                            <Frown className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-semibold">No New Arrivals Found</h3>
                            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or check back later!</p>
                        </div>
                    )}
                </div>
                
                {/* --- PAGINATION UI --- */}
                {!loading && totalPages > 1 && (
                    <div className="mt-12">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) handlePageChange(currentPage - 1); }} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} />
                                </PaginationItem>
                                
                                {[...Array(totalPages)].map((_, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(i + 1); }} isActive={currentPage === i + 1}>
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) handlePageChange(currentPage + 1); }} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </main>
        </>
    )
}