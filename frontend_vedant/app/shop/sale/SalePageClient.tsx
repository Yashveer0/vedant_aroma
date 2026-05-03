"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Frown } from "lucide-react"

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/lib/redux/store"
import { fetchProducts } from "@/lib/redux/slices/productSlice"

import ProductCard from "@/components/ProductCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ProductGridSkeleton from "@/components/skeleton/ProductGridSkeleton"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const CountdownTimer = () => {
    const calculateTimeLeft = () => {
        const difference = +new Date("2025-12-31T23:59:59") - +new Date();
        let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    useEffect(() => {
        const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearTimeout(timer);
    });
    return (
        <div className="flex space-x-4 md:space-x-6">
            {Object.entries(timeLeft).map(([interval, value]) => (
                <div key={interval} className="flex flex-col items-center">
                    <span className="text-2xl md:text-4xl font-mono font-bold">{String(value).padStart(2, '0')}</span>
                    <span className="text-xs uppercase tracking-widest">{interval}</span>
                </div>
            ))}
        </div>
    );
};

// --- Sale Header Component ---
const SaleHeader = () => (
    <div className="relative w-full bg-black">
        <div className="absolute inset-0 opacity-20"><Image src="https://images.unsplash.com/photo-1508056830983- unvexb21d582?q=80&w=2070" alt="Abstract background" fill className="object-cover" /></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4 py-12 md:py-16">
            <p className="font-semibold tracking-widest text-xs md:text-sm uppercase text-red-400">LIMITED TIME OFFER</p>
            <h1 className="text-4xl md:text-7xl font-serif font-bold my-3 md:my-4">Mid-Season Sale</h1>
            <p className="mt-2 max-w-xl text-sm md:text-base text-gray-300">Grab your favorites at unbeatable prices. Up to 50% off on selected items!</p>
            <div className="mt-8"><CountdownTimer /></div>
        </div>
    </div>
);


export default function SalePageClient() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { 
        items: saleProducts, 
        loading, 
        error, 
        currentPage, 
        totalPages 
    } = useSelector((state: RootState) => state.product);

    const [sortOption, setSortOption] = useState('featured');
    const [categoryFilter, setCategoryFilter] = useState('all');

    useEffect(() => {
        const page = searchParams.get('page') || '1';
        const queryParams: { onSale: string, page: string, category?: string } = {
            onSale: 'true',
            page: page,
        };

        if (categoryFilter !== 'all') {
            queryParams.category = categoryFilter;
        }

        dispatch(fetchProducts(queryParams));
    }, [dispatch, categoryFilter, searchParams]);

    const sortedProducts = useMemo(() => {
        const sorted = [...saleProducts];
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
                break;
        }
        return sorted;
    }, [sortOption, saleProducts]);

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

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <>
            <SaleHeader />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-4 border-b">
                     <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">Filter:</span>
                        <div className="flex gap-1 bg-gray-100 p-1 rounded-full">
                            <button onClick={() => setCategoryFilter('all')} className={`px-4 py-1.5 text-sm rounded-full transition-colors ${categoryFilter === 'all' ? 'bg-white shadow-sm text-black font-semibold' : 'text-gray-600'}`}>All</button>
                            <button onClick={() => setCategoryFilter('Clothing')} className={`px-4 py-1.5 text-sm rounded-full transition-colors ${categoryFilter === 'Clothing' ? 'bg-white shadow-sm text-black font-semibold' : 'text-gray-600'}`}>Clothing</button>
                            <button onClick={() => setCategoryFilter('Decorative')} className={`px-4 py-1.5 text-sm rounded-full transition-colors ${categoryFilter === 'Decorative' ? 'bg-white shadow-sm text-black font-semibold' : 'text-gray-600'}`}>Decorative</button>
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

                <div className="product-grid-container">
                    {loading ? (
                        <ProductGridSkeleton count={8} />
                    ) : error ? (
                        <div className="text-center py-20 text-red-500">Failed to load sale products.</div>
                    ) : mappedProducts.length > 0 ? (
                        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                            {mappedProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </motion.div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed rounded-2xl">
                            <Frown className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-semibold">No Products on Sale</h3>
                            <p className="mt-1 text-sm text-gray-500">Check back later for exciting deals!</p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && !loading && (
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