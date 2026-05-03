// [slug]/page.tsx (ProductDetailsPage) - COMPLETE FIXED VERSION

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, Minus, Plus, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/hooks/use-toast";

// --- UI Components ---
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ProductDetailsSkeleton from "@/components/skeleton/ProductPageSkeleton";
import { ProductReviews } from "@/components/ProductReviews";
import { RecommendedProducts } from "@/components/RecommendProducts";

// --- Redux & Context Integration ---
import { AppDispatch, RootState } from "@/lib/redux/store";
import { fetchProductBySlug, clearSelectedProduct } from "@/lib/redux/slices/productSlice";
import { selectIsAuthenticated } from "@/lib/redux/slices/authSlice";
import { addToCart as addCartToDb } from "@/lib/redux/slices/cartSlice";
import { useCart as useLocalCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { 
  addToWishlist as addWishlistToDb, 
  removeFromWishlist as removeWishlistFromDb,
  selectIsAddedToWishlist 
} from "@/lib/redux/slices/wishlistSlice";

// --- Types ---
import { Product, Variant } from "@/lib/types/product";

const ProductDetailsPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const { toast } = useToast();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // --- Redux State ---
  const { 
    selectedProduct: product, 
    productDetailsLoading: loading, 
    productDetailsError: error 
  } = useSelector((state: RootState) => state.product);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // --- Context Hooks ---
  const { addToCart: addCartToLocal } = useLocalCart();
  const { 
    addToWishlist: addWishlistToLocal, 
    removeFromWishlist: removeWishlistFromLocal, 
    isAddedToWishlist: isAddedToLocalWishlist 
  } = useWishlist();

  // --- Component State ---
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantSku, setSelectedVariantSku] = useState<string | null>(null);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  // --- Check wishlist status from Redux OR local context ---
  const isInReduxWishlist = useSelector((state: RootState) => 
    product?._id ? selectIsAddedToWishlist(product._id)(state) : false
  );
  
  const isWishlisted = isAuthenticated 
    ? isInReduxWishlist 
    : (product?._id ? isAddedToLocalWishlist(product._id, selectedVariantSku || undefined) : false);

  // --- Data Fetching ---
  useEffect(() => {
    if (slug) {
      dispatch(fetchProductBySlug(slug));
    }
    return () => { dispatch(clearSelectedProduct()); };
  }, [slug, dispatch]);

  // --- Single Initialization Effect ---
  useEffect(() => {
    if (product) {
      setQuantity(product.minQuantity || 1);
      setSelectedImage(0);
      const variants = product.variants ?? [];
      if (variants.length > 0) {
        const firstInStockVariant = variants.find(v => v.stock_quantity > 0);
        setSelectedVariantSku(firstInStockVariant ? firstInStockVariant.sku : variants[0].sku);
      } else {
        setSelectedVariantSku(null);
      }
    }
  }, [product]);

  // --- Derived State with Proper Defaults ---
  const {
    selectedVariant, displayPrice, originalPrice, hasSale, discount,
    currentStock, isOutOfStock, stockMessage, minQuantity, isBulkOrder,
  } = useMemo(() => {
    if (!product) return { 
      selectedVariant: null, displayPrice: 0, originalPrice: 0, hasSale: false,
      discount: 0, currentStock: 0, isOutOfStock: true, stockMessage: null,
      minQuantity: 1, isBulkOrder: false 
    };
    const variants = product.variants ?? [];
    const variant = variants.find(v => v.sku === selectedVariantSku) || null;
    const price = variant?.price ?? product.price ?? 0;
    const salePrice = variant?.sale_price ?? product.sale_price;
    const stock = variant?.stock_quantity ?? product.stock_quantity ?? 0;
    const finalPrice = salePrice ?? price;
    const finalHasSale = !!salePrice && salePrice < price;
    const finalDiscount = finalHasSale ? Math.round(((price - finalPrice) / price) * 100) : 0;
    let message: string | null = null;
    if (stock > 0 && stock <= 5) message = `Hurry! Only ${stock} left in stock.`;
    else if (stock < 1) message = "This option is currently out of stock.";
    return {
      selectedVariant: variant, displayPrice: finalPrice, originalPrice: price,
      hasSale: finalHasSale, discount: finalDiscount, currentStock: stock,
      isOutOfStock: stock < 1, stockMessage: message, minQuantity: product.minQuantity || 1,
      isBulkOrder: (product.minQuantity || 1) > 5,
    };
  }, [product, selectedVariantSku]);

  // --- OPTIMISTIC ADD TO CART HANDLER ---
  const handleAddToCart = async () => {
    if (!product || isOutOfStock) return;
    if (isBulkOrder) { router.push(`/bulk-order/${product.slug}`); return; }
    if (quantity < minQuantity) { 
      toast({ 
        title: "Minimum Quantity", 
        description: `You must add at least ${minQuantity} items.`, 
        variant: "destructive" 
      }); 
      return; 
    }
    if ((product.variants?.length ?? 0) > 0 && !selectedVariant) { 
      toast({ 
        title: "Selection needed", 
        description: "Please select an available size/volume.", 
        variant: "destructive" 
      }); 
      return; 
    }
    if (currentStock < quantity) { 
      toast({ 
        title: "Not enough stock", 
        description: `Only ${currentStock} available.`, 
        variant: "destructive" 
      }); 
      return; 
    }
    if (!product._id) { 
      toast({ 
        title: "Error", 
        description: "Invalid product ID", 
        variant: "destructive" 
      }); 
      return; 
    }

    // 🎯 OPTIMISTIC UPDATE - Pehle UI update karein
    setIsAddedToCart(true);
    toast({ 
      title: "✅ Added to Cart!", 
      description: `${quantity} x ${product.name} ${selectedVariant ? `(${selectedVariant.name})` : ''} has been added.` 
    });

    // Background mein API call karein
    try {
      if (isAuthenticated) {
        await dispatch(addCartToDb({ 
          productId: product._id, 
          sku_variant: selectedVariant?.sku, 
          quantity 
        })).unwrap();
      } else {
        addCartToLocal(product, selectedVariant ?? undefined, quantity);
      }
    } catch (error: any) {
      // Agar fail hua to user ko batayein
      toast({
        title: "Failed to Add to Cart",
        description: typeof error === 'string' ? error : "There was an issue adding the item.",
        variant: "destructive",
      });
      setIsAddedToCart(false); // Revert optimistic update
      return;
    }

    // 2 seconds baad button ko reset karein
    setTimeout(() => setIsAddedToCart(false), 2000);
  };

  // --- OPTIMISTIC WISHLIST TOGGLE HANDLER ---
  const handleToggleWishlist = async () => {
    if (!product?._id) return;
    
    const wasWishlisted = isWishlisted;
    
    // 🎯 OPTIMISTIC UPDATE - Pehle toast dikhayein
    toast({ 
      title: wasWishlisted ? "❤️ Removed from Wishlist" : "❤️ Added to Wishlist" 
    });

    // Background mein state update karein
    try {
      if (isAuthenticated) {
        // Redux action dispatch karein
        if (wasWishlisted) {
          await dispatch(removeWishlistFromDb(product._id)).unwrap();
        } else {
          await dispatch(addWishlistToDb(product._id)).unwrap();
        }
      } else {
        // Local context immediately update ho jayega
        if (wasWishlisted) {
          removeWishlistFromLocal(product._id, selectedVariant?.sku);
        } else {
          addWishlistToLocal(product, selectedVariant ?? undefined);
        }
      }
    } catch (error: any) {
      // Agar fail hua to user ko batayein aur revert karein
      toast({
        title: "Failed to Update Wishlist",
        description: typeof error === 'string' ? error : "There was an issue updating your wishlist.",
        variant: "destructive",
      });
      
      // Revert the optimistic update for authenticated users
      if (isAuthenticated) {
        if (!wasWishlisted) {
          await dispatch(removeWishlistFromDb(product._id)).unwrap();
        } else {
          await dispatch(addWishlistToDb(product._id)).unwrap();
        }
      }
    }
  };
  
  const incrementQuantity = () => setQuantity(q => Math.min(q + 1, currentStock));
  const decrementQuantity = () => setQuantity(q => Math.max(minQuantity, q - 1));

  // --- Render Logic ---
  if (loading) return ( <div className="bg-gray-50"><Navbar /><ProductDetailsSkeleton /><Footer /></div> );
  if (error || !product) return ( <div className="bg-gray-50"><Navbar /><div className="container mx-auto text-center py-20"><h2 className="text-2xl font-bold text-red-600">{error ? "Failed to load product" : "Product Not Found"}</h2><p className="text-gray-600 mt-2">{error || "The product you are looking for does not exist."}</p><Button onClick={() => router.push('/shop')} className="mt-4">Go to Shop</Button></div><Footer /></div> );

  return (
    <div className="bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* LEFT: MEDIA GALLERY */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col-reverse md:flex-row gap-4">
            <div className="flex md:flex-col gap-3 md:overflow-y-auto pb-2 md:pb-0 md:pr-2">
              {product.images.map((img: string, idx: number) => (
                <button key={idx} onClick={() => setSelectedImage(idx)} className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${selectedImage === idx ? 'border-primary' : 'border-transparent'}`}>
                  <Image src={img} alt={`${product.name} thumbnail ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100">
              <Image src={product.images[selectedImage]} alt={product.name} fill className="object-cover" />
            </div>
          </motion.div>

          {/* RIGHT: PRODUCT DETAILS & ACTIONS */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <p className="font-semibold text-primary">{product.brand}</p>
            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-gray-800 my-2">{product.name}</h1>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">₹{(displayPrice || 0).toLocaleString()}</span>
              {hasSale && <span className="text-xl text-gray-400 line-through">₹{(originalPrice || 0).toLocaleString()}</span>}
              {hasSale && <span className="bg-red-100 text-red-600 text-sm font-semibold px-2.5 py-1 rounded-full">{discount}% OFF</span>}
            </div>
            {(product.variants?.length ?? 0) > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Size / Volume: <span className="font-bold">{selectedVariant?.name || 'Select'}</span></h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants!.map((variant) => (
                    <button key={variant.sku} onClick={() => setSelectedVariantSku(variant.sku)} disabled={variant.stock_quantity < 1} className={`px-4 py-2 border rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 disabled:line-through ${selectedVariantSku === variant.sku ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}>
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-4 mb-6">
              {/* {!isBulkOrder && (<div className="flex items-center border rounded-full font-semibold"><Button variant="ghost" size="icon" onClick={decrementQuantity} disabled={isOutOfStock} className="h-11 w-11 rounded-full"><Minus size={16} /></Button><span className="w-10 text-center">{quantity}</span><Button variant="ghost" size="icon" onClick={incrementQuantity} disabled={isOutOfStock} className="h-11 w-11 rounded-full"><Plus size={16} /></Button></div>)} */}
              
              {!isBulkOrder && product.type !== 'service' && (
                <div className="flex items-center border rounded-full font-semibold">
                    <Button variant="ghost" size="icon" onClick={decrementQuantity} disabled={isOutOfStock} className="h-11 w-11 rounded-full"><Minus size={16} /></Button>
                    <span className="w-10 text-center">{quantity}</span>
                    <Button variant="ghost" size="icon" onClick={incrementQuantity} disabled={isOutOfStock} className="h-11 w-11 rounded-full"><Plus size={16} /></Button>
                </div>
                )}

              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 h-12 rounded-full text-base font-bold disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 ease-in-out ${isAddedToCart ? 'bg-green-500 hover:bg-green-600' : 'bg-black hover:bg-gray-800'}`}
              >
                {isBulkOrder ? 'Submit Bulk Inquiry' : (isOutOfStock ? 'Out of Stock' : (isAddedToCart ? <><Check size={18} className="mr-2" /> Added!</> : 'Add to Bag'))}
              </Button>
              <Button variant="outline" size="icon" onClick={handleToggleWishlist} className="h-12 w-12 rounded-full flex-shrink-0">
                <Heart
                  className={`transition-all duration-300 ease-in-out ${
                    isWishlisted
                      ? 'fill-red-500 text-red-500'
                      : 'fill-transparent text-gray-500'
                  }`}
                />
              </Button>
            </div>
            <div className="h-6 mb-4 text-sm text-center font-medium">
              {stockMessage && <p className={isOutOfStock ? "text-gray-500" : "text-red-600"}>{stockMessage}</p>}
              {!stockMessage && minQuantity > 1 && !isBulkOrder && <p className="text-gray-600">Minimum order quantity: <strong>{minQuantity}</strong></p>}
              {!stockMessage && isBulkOrder && <p className="text-gray-600">This item is for bulk orders only.</p>}
            </div>
            <Separator className="my-6"/><div className="space-y-4"><div><h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3><div className="prose text-gray-600 max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} /></div></div><Separator className="my-6"/>
            <Accordion type="single" collapsible className="w-full"><AccordionItem value="shipping"><AccordionTrigger>Shipping & Returns</AccordionTrigger><AccordionContent className="text-gray-600 prose-sm max-w-none"><p>Free standard shipping on all orders over ₹1,999.</p><p>We accept returns within 14 days of delivery. Please visit our <Link href="/return-policy" className="text-primary underline">Return Policy</Link> page for more details.</p></AccordionContent></AccordionItem></Accordion>
          </motion.div>
        </div>
        <ProductReviews product={product} />
        <RecommendedProducts currentProduct={product} />
      </main>
      <Footer />
    </div>
  )
}

export default ProductDetailsPage;