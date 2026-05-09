// wishlistPage.tsx
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// --- REDUX & CONTEXT IMPORTS (Yahan changes hain) ---
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from "@/lib/redux/store";
import { selectIsAuthenticated } from "@/lib/redux/slices/authSlice";
import { fetchWishlist, removeFromWishlist as removeWishlistFromDb } from "@/lib/redux/slices/wishlistSlice";
// import { addToCart as addCartToDb } from "@/lib/redux/slices/cartSlice";
import { addToCart as addToCartInDb } from "@/lib/redux/slices/cartSlice";

import { fetchProductById } from "@/lib/redux/slices/productSlice";
import { useWishlist as useLocalWishlist } from "@/context/WishlistContext";
import { useCart as useLocalCart } from "@/context/CartContext";
import { Product } from "@/lib/types/product";
import { resolveMediaUrls } from "@/lib/media";

// --- Custom hook to fetch live product data ---
const useLiveProductData = (productId: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const [liveProduct, setLiveProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLiveData = async () => {
      setIsLoading(true);
      try {
        const result = await dispatch(fetchProductById(productId));
        if (fetchProductById.fulfilled.match(result)) {
          setLiveProduct(result.payload);
        }
      } catch (error) {
        console.error('Failed to fetch live product data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchLiveData();
    }
  }, [dispatch, productId]);

  return { liveProduct, isLoading };
};

// --- WishlistItemCard Component (Updated for new data structure) ---
const WishlistItemCard = ({ item, onRemove, onAddToCart }: { item: any, onRemove: Function, onAddToCart: Function }) => {
  // Handle both database (WishlistItemBackend) and local (WishlistItem) data structures
  const isLocalWishlistItem = item.product !== undefined; // Local items have item.product
  const product = isLocalWishlistItem ? item.product : item; // Database items are products directly
  const selectedVariant = isLocalWishlistItem ? item.selectedVariant : null; // Only local items have variants
  const skuVariant = isLocalWishlistItem ? item.sku_variant : 'default'; // Database items use default
  
  // Fetch live product data for real-time stock checking
  const { liveProduct, isLoading: isLiveDataLoading } = useLiveProductData(product._id);
  
  // Handle missing fields gracefully
  const discount = product.base_price && product.base_price > product.price
    ? Math.round(((product.base_price - product.price) / product.base_price) * 100)
    : 0;
  
  // Ensure we have required fields with fallbacks
  const productSlug = product.slug || product._id; // Fallback to _id if slug is missing
  const productImages = resolveMediaUrls(product.images);
  const productPrice = selectedVariant ? (selectedVariant.sale_price || selectedVariant.price) : (product.price || 0);
  
  // Fix stock quantity calculation - use LIVE product data for real-time stock checking
  let stockQuantity = 0;
  
  // Use live product data if available, otherwise fall back to saved data
  const currentProduct = liveProduct || product;
  
  if (isLocalWishlistItem && selectedVariant) {
    // Local wishlist item with selected variant - use live variant stock if available
    if (liveProduct && liveProduct.variants) {
      const liveVariant = liveProduct.variants.find((v: any) => v.sku_variant === selectedVariant.sku_variant);
      stockQuantity = liveVariant?.stock_quantity || selectedVariant.stock_quantity || 0;
    } else {
      stockQuantity = selectedVariant.stock_quantity || 0;
    }
  } else if (isLocalWishlistItem) {
    // Local wishlist item without variant - use live product stock
    stockQuantity = currentProduct.stock_quantity || product.stock_quantity || product.stock || 0;
  } else {
    // Database wishlist item - use live product data
    if (currentProduct.variants && currentProduct.variants.length > 0) {
      // For database items with variants, use the first variant's stock or product stock
      const firstVariant = currentProduct.variants[0];
      stockQuantity = firstVariant.stock_quantity || currentProduct.stock_quantity || 0;
    } else {
      // Database item without variants - use product stock directly
      stockQuantity = currentProduct.stock_quantity || 0;
    }
  }
  
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="bg-white rounded-md shadow-sm overflow-hidden group flex flex-col">
      <div className="relative w-full aspect-[3/4] bg-gray-50">
        <Link href={`/product/${productSlug}`}>
          <Image src={productImages[0] || "/placeholder.svg"} alt={product.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105"/>
        </Link>
        {discount > 0 && <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">-{discount}%</span>}
        <button onClick={() => onRemove(product._id, product.name, skuVariant)} className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove from wishlist">
          <Trash2 size={16} className="text-red-500" />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <Link href={`/product/${productSlug}`} className="text-sm font-semibold text-gray-800 line-clamp-2 hover:text-[var(--theme-accent)] transition-colors">{product.name}</Link>
          {selectedVariant && (
            <div className="text-xs text-gray-600 mt-1">
              Size: {selectedVariant.size} | Color: {selectedVariant.color}
            </div>
          )}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-lg font-bold text-gray-900">₹{productPrice.toLocaleString()}</span>
            {product.base_price && <span className="text-sm text-gray-500 line-through">₹{(product.base_price).toLocaleString()}</span>}
          </div>
        </div>
        <Button 
          onClick={() => onAddToCart(item)} 
          className="w-full mt-4 bg-black text-white hover:bg-gray-800 rounded-md h-11 font-semibold" 
          disabled={stockQuantity === 0 || isLiveDataLoading}
        >
          {isLiveDataLoading ? "Checking Stock..." : (stockQuantity === 0 ? "Out of Stock" : "Move to Bag")}
        </Button>
      </div>
    </motion.div>
  );
};

// --- WishlistPage Component (Isme major changes hain) ---
export default function WishlistPage() {
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(selectIsAuthenticated);

   // Data Source #1: Local Wishlist (Guest) from Context
   const { items: localWishlistItems, removeFromWishlist: removeWishlistFromLocal } = useLocalWishlist();
   const { addToCart: addCartToLocal } = useLocalCart();
 
   // Data Source #2: DB Wishlist (Logged-in User) from Redux Store
   const { items: dbWishlistItems, status: wishlistStatus, error: wishlistError } = useSelector((state: RootState) => state.wishlist);
  // Agar user logged in hai, to database se wishlist fetch karo
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, dispatch]);

  const handleRemoveFromWishlist = (productId: string, productName: string, skuVariant?: string) => {
    if (isAuthenticated) {
      // The DB wishlist only cares about the product ID
      dispatch(removeWishlistFromDb(productId));
    } else {
      // The local wishlist might care about the specific variant ID
      removeWishlistFromLocal(productId, skuVariant);
    }
    toast({
      title: "❤️ Removed from Wishlist",
      description: `${productName} has been removed.`,
    });
  };

  const handleMoveToCart = (item: any) => {
    const isLocalItem = item.product !== undefined;
    const product: Product = isLocalItem ? item.product : item;
    if (!product?._id) {
      console.error("Attempted to move an item to cart without a valid product ID.", item);
      toast({
          title: "Error",
          description: "Could not add item to cart. Product ID is missing.",
          variant: "destructive"
      });
      return; // Stop the function here
    }
    const selectedVariant = isLocalItem ? item.selectedVariant : null;
    
    // This variable will hold the specific SKU to be added to the cart.
    let skuToAdd: string | undefined = undefined;

    if (isAuthenticated) {
      // --- LOGIC FOR LOGGED-IN USERS ---
      // DB wishlists only store the product. We need to decide which variant to add.
      // Defaulting to the first available variant is a reasonable approach.
      if (product.variants && product.variants.length > 0) {
        // --- FIX #1: Use the correct field name 'sku' ---
        skuToAdd = product.variants[0].sku; 
        if (!skuToAdd) {
            toast({ title: "Error", description: `Could not find a variant for ${product.name}.`, variant: "destructive"});
            return;
        }
      }
      // If there are no variants, skuToAdd remains undefined, which is correct for simple products.

      dispatch(addToCartInDb({ 
        productId: product._id, 
        sku_variant: skuToAdd, // Pass the determined SKU
        quantity: 1 
      }));
      // Remove from DB wishlist after moving
      dispatch(removeWishlistFromDb(product._id));

    } else {
      // --- LOGIC FOR GUEST USERS (Your existing logic was correct) ---
      // Local wishlist items already have the selected variant stored.
      addCartToLocal(product, selectedVariant, 1);
      // --- FIX #2: Use the correct SKU field for removal ---
      const skuToRemove = selectedVariant ? selectedVariant.sku : undefined;
      removeWishlistFromLocal(product._id, skuToRemove);
    }

    toast({
      title: "✅ Moved to Bag",
      description: `${product.name} has been moved to your bag.`,
    });
  };

  // --- DATA SELECTION LOGIC (Sabse important hissa) ---
  // Agar user logged in hai to `dbWishlistItems` use karo, warna `localWishlistItems`
  const wishlistItems = isAuthenticated ? dbWishlistItems : localWishlistItems;
  

  // --- RENDER LOGIC (Ab yeh 'wishlistItems' variable use karega) ---
  
  // Show loading state for authenticated users
  if (isAuthenticated && wishlistStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--theme-background)]">
        <Navbar />
        <main className="container mx-auto px-4 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Heart className="h-20 w-20 mx-auto mb-6 text-gray-300 animate-pulse" />
            <h1 className="text-3xl font-serif font-bold text-gray-800 mb-2">Loading your wishlist...</h1>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Please wait while we fetch your saved items.</p>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state for authenticated users
  if (isAuthenticated && wishlistStatus === 'failed') {
    return (
      <div className="min-h-screen bg-[var(--theme-background)]">
        <Navbar />
        <main className="container mx-auto px-4 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Heart className="h-20 w-20 mx-auto mb-6 text-red-300" />
            <h1 className="text-3xl font-serif font-bold text-gray-800 mb-2">Failed to load wishlist</h1>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">{wishlistError || 'Something went wrong. Please try again.'}</p>
            <Button onClick={() => dispatch(fetchWishlist())} className="bg-black text-white hover:bg-gray-800 px-8 py-6 rounded-full font-semibold text-lg shadow-lg transition-all duration-300 hover:scale-105">
              Try Again
            </Button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--theme-background)]">
        <Navbar />
        <main className="container mx-auto px-4 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Heart className="h-20 w-20 mx-auto mb-6 text-gray-300" />
            <h1 className="text-3xl font-serif font-bold text-gray-800 mb-2">Your Wishlist is Empty</h1>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Looks like you haven’t saved anything yet. Tap the heart on products you love!</p>
            <Link href="/">
              <Button className="bg-black text-white hover:bg-gray-800 px-8 py-6 rounded-full font-semibold text-lg shadow-lg transition-all duration-300 hover:scale-105">
                Discover Products
              </Button>
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--theme-background)]">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition-colors"><ArrowLeft size={16} /> Back to shopping</Link>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-serif font-bold text-gray-800">My Wishlist</h1>
            <p className="text-gray-500 mt-1">{wishlistItems.length} items saved</p>
          </div>
        </motion.div>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence>
            {wishlistItems.map((item) => {
              // Handle both new (WishlistItem) and old (WishlistItemBackend) data structures
              const itemId = (item as any).product?._id || (item as any)._id;
              return (
                <WishlistItemCard key={itemId} item={item} onRemove={handleRemoveFromWishlist} onAddToCart={handleMoveToCart} />
              );
            })}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  )
}
