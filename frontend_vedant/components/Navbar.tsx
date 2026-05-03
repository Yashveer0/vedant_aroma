"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, User, ShoppingBag, ChevronDown, Menu, Leaf, Heart, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// --- UI IMPORTS ---
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- HOOKS ---
import { useDebounce } from '@/hooks/useDebounce';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

// --- REDUX IMPORTS ---
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { fetchCategories } from '@/lib/redux/slices/adminSlice';
import { selectIsAuthenticated, selectCurrentUser, logout } from '@/lib/redux/slices/authSlice';
import { fetchSearchResults, clearSearchResults } from '@/lib/redux/slices/productSlice';
import { fetchCart } from '@/lib/redux/slices/cartSlice';
import { fetchWishlist, selectTotalWishlistItems } from '@/lib/redux/slices/wishlistSlice';

// --- CONTEXT ---
import { useCart as useLocalCart } from '@/context/CartContext';
import { useWishlist as useLocalWishlist } from '@/context/WishlistContext';

const Navbar = () => {
    const [isShopMenuOpen, setIsShopMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    
    // --- REDUX HOOKS & STATE ---
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { categories, categoryStatus } = useSelector((state: RootState) => state.admin);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const currentUser = useSelector(selectCurrentUser);
    const { searchResults, searchLoading } = useSelector((state: RootState) => state.product);
    const dbTotalCartItems = useSelector((state: RootState) => state.cart.totalItems);
    const dbTotalWishlistItems = useSelector(selectTotalWishlistItems);
    const { totalItems: localTotalCartItems } = useLocalCart();
    const { totalItems: localTotalWishlistItems } = useLocalWishlist();
    
    const totalCartItems = isAuthenticated ? dbTotalCartItems : localTotalCartItems;
    const totalWishlistItems = isAuthenticated ? dbTotalWishlistItems : localTotalWishlistItems;
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    
    useOnClickOutside(searchRef, () => {
        setIsSearchOpen(false);
        setSearchQuery('');
    });

    useEffect(() => {
        if (categoryStatus === 'idle') {
            dispatch(fetchCategories());
        }
        if (isAuthenticated) {
            dispatch(fetchCart());
            dispatch(fetchWishlist());
        }
    }, [categoryStatus, dispatch, isAuthenticated]);

    useEffect(() => {
        if (debouncedSearchQuery.length > 2) {
            dispatch(fetchSearchResults({ search: debouncedSearchQuery, limit: 5 }));
            setIsSearchOpen(true);
        } else {
            dispatch(clearSearchResults());
            setIsSearchOpen(false);
        }
    }, [debouncedSearchQuery, dispatch]);

    const handleLogout = () => {
        dispatch(logout());
        toast.success("You have been successfully logged out.");
        router.push('/');
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setIsSearchOpen(false);
        setIsMobileMenuOpen(false);
        router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    };

    const shopMenuItems = categories.map(category => ({
        name: category.name,
        href: `/shop?category=${encodeURIComponent(category.name)}`,
        icon: "🌿"
    }));

    shopMenuItems.push({
        name: "All Products",
        href: "/shop",
        icon: "🛍️"
    });

    const dropdownVariants = {
        hidden: { opacity: 0, y: -10, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
        exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } }
    };

    // --- User Account Dropdown Component ---
    const UserAccountNav = () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-green-200 transition-all duration-300 hover:scale-110 p-2 hover:bg-white/10 rounded-full"
                    aria-label="Account"
                >
                    <User size={22} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white text-gray-800" align="end">
                {isAuthenticated && currentUser ? (
                    <>
                        <DropdownMenuLabel>
                            My Account
                            <p className="text-xs font-normal text-gray-500 truncate">{currentUser.email}</p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/account/user">My Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/account/user/order-history">My Orders</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">
                            Logout
                        </DropdownMenuItem>
                    </>
                ) : (
                    <>
                        <DropdownMenuLabel>Welcome, Guest!</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/login">Login</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/signup">Sign Up</Link>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const NavLinks = ({ isMobile = false }) => (
        <nav className={`flex items-center ${isMobile ? 'flex-col space-y-6 text-base' : 'space-x-8 text-sm font-semibold'}`}>
            <Link href="/" className="hover:text-green-200 transition-colors relative group" onClick={() => setIsMobileMenuOpen(false)}>
                HOME
                {!isMobile && <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-200 transition-all duration-300 group-hover:w-full"></span>}
            </Link>
            <div className={`relative ${isMobile ? 'w-full' : ''}`} onMouseEnter={() => !isMobile && setIsShopMenuOpen(true)} onMouseLeave={() => !isMobile && setIsShopMenuOpen(false)}>
                <Link href="/shop" className="flex items-center gap-1 hover:text-green-200 transition-colors relative group">
                    SHOP <ChevronDown size={16} className="transition-transform group-hover:rotate-180 duration-300" />
                    {!isMobile && <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-200 transition-all duration-300 group-hover:w-full"></span>}
                </Link>
                {!isMobile && (
                    <AnimatePresence>
                        {isShopMenuOpen && (
                            <motion.div variants={dropdownVariants} initial="hidden" animate="visible" exit="exit" className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-white rounded-2xl shadow-2xl border border-green-100 overflow-hidden z-50">
                                <div className="p-3">
                                    {shopMenuItems.map(item => (
                                        <Link key={item.name} href={item.href} className="flex items-center gap-3 px-4 py-3 text-[var(--card-text)] rounded-xl hover:bg-green-50 hover:text-[var(--text-primary)] transition-all duration-200 group" onClick={() => setIsShopMenuOpen(false)}>
                                            <span className="text-xl group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                                            <span className="font-medium">{item.name}</span>
                                        </Link>
                                    ))}
                                </div>
                                <div className="h-1 bg-gradient-to-r from-[var(--text-primary)] via-[var(--base-200)] to-[var(--text-primary)]"></div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
                {isMobile && (
                    <div className="mt-3 ml-4 space-y-2">
                        {shopMenuItems.map(item => (
                            <SheetClose asChild key={item.name}>
                                <Link href={item.href} className="flex items-center gap-3 px-4 py-2 text-white/90 hover:text-white transition-colors">
                                    <span className="text-lg">{item.icon}</span>
                                    <span>{item.name}</span>
                                </Link>
                            </SheetClose>
                        ))}
                    </div>
                )}
            </div>
            <Link href="/about-us" className="hover:text-green-200 transition-colors relative group" onClick={() => setIsMobileMenuOpen(false)}>
                ABOUT US
                {!isMobile && <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-200 transition-all duration-300 group-hover:w-full"></span>}
            </Link>
            <Link href="/shop?type=service" className="hover:text-green-200 transition-colors relative group" onClick={() => setIsMobileMenuOpen(false)}>
                SERVICES
                {!isMobile && <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-200 transition-all duration-300 group-hover:w-full"></span>}
            </Link>
            <Link href="/shop/best-sellers" className="hover:text-green-200 transition-colors relative group" onClick={() => setIsMobileMenuOpen(false)}>
                BEST-SELLER
                {!isMobile && <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-200 transition-all duration-300 group-hover:w-full"></span>}
            </Link>
            <Link href="/shop/new-arrivals" className="hover:text-green-200 transition-colors relative group" onClick={() => setIsMobileMenuOpen(false)}>
                NEW ARRIVALS
                {!isMobile && <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-200 transition-all duration-300 group-hover:w-full"></span>}
            </Link>
            <Link href="/blogs" className="hover:text-green-200 transition-colors relative group" onClick={() => setIsMobileMenuOpen(false)}>
                BLOGS
                {!isMobile && <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-200 transition-all duration-300 group-hover:w-full"></span>}
            </Link>
        </nav>
    );

    return (
        <header className="sticky top-0 z-50 bg-gradient-to-r from-[var(--text-primary)] via-[var(--base-200)] to-[var(--text-primary)] text-white shadow-lg">
            <div className="h-1 bg-gradient-to-r from-amber-400 via-green-300 to-amber-400"></div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-20">
                    <div className="flex-shrink-0 relative group w-20">
                        <Link href="/" className="block">
                            <div className="relative">
                                <Image src="/logo.webp" width={80} height={80} alt="Vedant Gurukul Logo" className="transition-transform duration-300 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                            </div>
                        </Link>
                    </div>
                    <div className="hidden lg:flex flex-col items-center flex-1 justify-center">
                        <h1 className="text-2xl xl:text-3xl font-serif font-bold tracking-wide">
                            Vedant Gurukul Aroma Mart
                        </h1>
                        <div className="mt-1"><NavLinks /></div>
                    </div>
                    <div className="flex items-center justify-end space-x-4 md:space-x-5 ml-auto">
                        {/* Desktop Search */}
                        <div ref={searchRef} className="hidden md:block relative">
                            <button 
                                type="button"
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className="hover:text-green-200 transition-all duration-300 hover:scale-110 p-2 hover:bg-white/10 rounded-full" 
                                aria-label="Search"
                            >
                                <Search size={22} />
                            </button>
                            <AnimatePresence>
                                {isSearchOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-green-100 overflow-hidden"
                                    >
                                        <div className="p-4">
                                            <form onSubmit={handleSearchSubmit} className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input 
                                                    type="text" 
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Search products..." 
                                                    className="w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800" 
                                                    autoFocus
                                                />
                                            </form>
                                        </div>
                                        {searchQuery.length > 2 && (
                                            <>
                                                {searchLoading && (
                                                    <div className="p-4 text-center border-t">
                                                        <Loader2 className="h-5 w-5 animate-spin inline-block text-green-600" />
                                                    </div>
                                                )}
                                                {!searchLoading && searchResults.length > 0 && (
                                                    <div className="border-t max-h-96 overflow-y-auto">
                                                        <ul>
                                                            {searchResults.map((p: any) => (
                                                                <li key={p._id}>
                                                                    <Link
                                                                        href={`/product/${p.slug}`}
                                                                        onClick={() => {
                                                                            setIsSearchOpen(false);
                                                                            setSearchQuery('');
                                                                        }}
                                                                        className="flex items-center gap-3 p-3 hover:bg-green-50 transition-colors"
                                                                    >
                                                                        <Image src={p.images[0]} alt={p.name} width={40} height={40} quality={30} className="rounded object-cover" />
                                                                        <span className="text-sm font-medium text-gray-800">{p.name}</span>
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                            <li>
                                                                <Link
                                                                    href={`/shop?search=${encodeURIComponent(searchQuery.trim())}`}
                                                                    onClick={() => {
                                                                        setIsSearchOpen(false);
                                                                        setSearchQuery('');
                                                                    }}
                                                                    className="block w-full text-center p-3 font-semibold text-sm text-green-600 hover:bg-green-50 transition-colors"
                                                                >
                                                                    View all results
                                                                </Link>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                )}
                                                {!searchLoading && searchResults.length === 0 && debouncedSearchQuery.length > 2 && (
                                                    <div className="p-4 text-center text-sm text-gray-500 border-t">No results found.</div>
                                                )}
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <Link href="/wishlist" className="hover:text-green-200 transition-all duration-300 hover:scale-110 p-2 hover:bg-white/10 rounded-full relative" aria-label="Wishlist">
                            <Heart size={22} />
                            {totalWishlistItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                    {totalWishlistItems}
                                </span>
                            )}
                        </Link>
                        
                        <UserAccountNav />
                        
                        <Link href="/cart" className="hover:text-green-200 transition-all duration-300 hover:scale-110 p-2 hover:bg-white/10 rounded-full relative" aria-label="Shopping Cart">
                            <ShoppingBag size={22} />
                            {totalCartItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                    {totalCartItems}
                                </span>
                            )}
                        </Link>
                        
                        <div className="lg:hidden">
                            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="hover:bg-white/20 hover:text-green-200 transition-all duration-300">
                                        <Menu size={26} />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-full max-w-sm px-6 bg-gradient-to-b from-[var(--text-primary)] to-[var(--base-200)] text-white border-l-4 border-amber-400 overflow-y-auto">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <Leaf className="h-6 w-6 text-green-200" />
                                            <SheetTitle className="text-2xl font-serif text-white">Menu</SheetTitle>
                                        </div>
                                    </div>
                                    
                                    {/* Mobile Search */}
                                    <div className="mb-6">
                                        <form onSubmit={handleSearchSubmit} className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input 
                                                type="text" 
                                                value={searchQuery} 
                                                onChange={(e) => setSearchQuery(e.target.value)} 
                                                placeholder="Search products..." 
                                                className="w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800" 
                                            />
                                        </form>
                                        {searchQuery.length > 2 && (
                                            <div className="mt-2 w-full bg-white rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                                                {searchLoading && (
                                                    <div className="p-4 text-center">
                                                        <Loader2 className="h-5 w-5 animate-spin inline-block text-green-600" />
                                                    </div>
                                                )}
                                                {!searchLoading && searchResults.length > 0 && (
                                                    <ul>
                                                        {searchResults.map((p: any) => (
                                                            <li key={p._id}>
                                                                <SheetClose asChild>
                                                                    <Link
                                                                        href={`/product/${p.slug}`}
                                                                        onClick={() => setSearchQuery('')}
                                                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                                                                    >
                                                                        <Image src={p.images[0]} alt={p.name} width={40} height={40} quality={30} className="rounded object-cover" />
                                                                        <span className="text-sm font-medium text-gray-800">{p.name}</span>
                                                                    </Link>
                                                                </SheetClose>
                                                            </li>
                                                        ))}
                                                        <li>
                                                            <SheetClose asChild>
                                                                <Link
                                                                    href={`/shop?search=${encodeURIComponent(searchQuery.trim())}`}
                                                                    onClick={() => setSearchQuery('')}
                                                                    className="block w-full text-center p-3 font-semibold text-sm text-green-600 hover:bg-green-50 transition-colors"
                                                                >
                                                                    View all results
                                                                </Link>
                                                            </SheetClose>
                                                        </li>
                                                    </ul>
                                                )}
                                                {!searchLoading && searchResults.length === 0 && debouncedSearchQuery.length > 2 && (
                                                    <div className="p-4 text-center text-sm text-gray-500">No results found.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <NavLinks isMobile={true} />
                                    <div className="mt-12 pt-8 border-t border-white/20">
                                        <p className="text-sm text-green-100 italic text-center">Pure • Natural • Authentic</p>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-green-300/50 to-transparent"></div>
        </header>
    );
};

export default Navbar;