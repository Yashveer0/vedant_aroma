"use client"

import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

// --- UI Components & Hooks ---
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { useToast } from "@/hooks/use-toast"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Lock, CreditCard } from "lucide-react"

// --- State Management Logic (Redux & Context) ---
import { useSelector, useDispatch } from 'react-redux'
import { AppDispatch, RootState } from "@/lib/redux/store"
import { selectIsAuthenticated } from "@/lib/redux/slices/authSlice"
import { fetchCart, removeFromCart, updateCartQuantity } from "@/lib/redux/slices/cartSlice"
import { useCart as useLocalCart } from "@/context/CartContext" // Aliased to prevent naming conflicts
import { resolveMediaUrl } from "@/lib/media"

// =================================================================
// --- SUBCOMPONENT: Cart Item Card ---
// This is a generic component that displays a cart item, whether it comes from Redux or Context.
// =================================================================
const CartItemCard = ({ item, onUpdate, onRemove, isGuestCart }: { item: any, onUpdate: Function, onRemove: Function, isGuestCart: boolean }) => {
    // Determine product details based on the data source (guest vs. logged-in)
    const productDetails = isGuestCart ? item : item.product;
    const productName = productDetails?.name;
    const productSlug = productDetails?.slug;
    const productImage = resolveMediaUrl(item.image || productDetails.images?.[0]);
    const productPrice = item.price;
    const productType = productDetails?.type; // <-- Get the product type

    // For guest cart, we need to handle both simple products and variants
    const updateId = isGuestCart ? item.productId : item.product?._id;
    const removeId = isGuestCart ? item.productId : item._id;
    const skuVariant = isGuestCart ? item.sku_variant : item.sku_variant;

    console.log("---productType---", productType)

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="grid grid-cols-12 items-center gap-4 py-4"
        >
            {/* Product Details */}
            <div className="col-span-12 md:col-span-6 flex items-center gap-4">
                <Link href={`/product/${productSlug}`}>
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image
                            src={productImage}
                            alt={productName}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                </Link>
                <div>
                    <Link href={`/product/${productSlug}`} className="font-semibold text-gray-800 hover:text-[var(--theme-accent)] transition-colors">{productName}</Link>
                    {/* Display variant information if available */}
                    {isGuestCart && item.attributes && (
                        <div className="text-sm text-gray-600 mt-1">
                            {item.attributes.size && <span>Size: {item.attributes.size}</span>}
                            {item.attributes.color && <span className="ml-2">Color: {item.attributes.color}</span>}
                        </div>
                    )}
                    {!isGuestCart && item.attributes && (
                        <div className="text-sm text-gray-600 mt-1">
                            {item.attributes.size && <span>Size: {item.attributes.size}</span>}
                            {item.attributes.color && <span className="ml-2">Color: {item.attributes.color}</span>}
                        </div>
                    )}
                    {/* <div>product type - {productType}</div>/ */}
                    <button
                        onClick={() => onRemove(removeId, productName, skuVariant)}
                        className="text-xs text-red-500 hover:underline mt-2 flex items-center gap-1"
                    >
                        <Trash2 size={12} /> Remove
                    </button>
                </div>
            </div>

            {/* Quantity Selector */}
            <div className="col-span-6 md:col-span-3 flex justify-center">
                {/* --- MODIFICATION START --- */}
                {/* Conditionally render the quantity selector */}
                {productType !== 'service' ? (
                    <div className="flex items-center border rounded-full">
                        <Button variant="ghost" size="icon" onClick={() => onUpdate(updateId, skuVariant, item.quantity - 1)} className="h-8 w-8 rounded-full"><Minus className="h-4 w-4" /></Button>
                        <span className="px-4 font-medium text-sm w-12 text-center">{item.quantity}</span>
                        <Button variant="ghost" size="icon" onClick={() => onUpdate(updateId, skuVariant, item.quantity + 1)} className="h-8 w-8 rounded-full"><Plus className="h-4 w-4" /></Button>
                    </div>
                ) : (
                    // For services, we display a static quantity of 1 and no buttons.
                    <span className="font-medium text-sm text-center">1</span>
                )}
                {/* --- MODIFICATION END --- */}
            </div>

            {/* Item Total Price */}
            <div className="col-span-6 md:col-span-3 text-right">
                <p className="font-semibold text-gray-800">₹{(productPrice * item.quantity).toLocaleString()}</p>
            </div>
        </motion.div>
    );
};


// =================================================================
// --- MAIN COMPONENT: Cart Page ---
// =================================================================
export default function CartPage() {
    const { toast } = useToast();
    const dispatch = useDispatch<AppDispatch>();
    
    // --- STATE SELECTORS ---
    const isAuthenticated = useSelector(selectIsAuthenticated);
    
    // Data Source #1: Local (Guest) Cart from Context
    const { 
        items: localCartItems, 
        updateQuantity: updateLocalQuantity, 
        removeFromCart: removeFromLocalCart, 
        totalItems: localTotalItems, 
        totalPrice: localTotalPrice 
    } = useLocalCart();

    // Data Source #2: DB (Logged-in) Cart from Redux
    const {
        items: dbCartItems,
        totalItems: dbTotalItems,
        finalTotal: dbFinalTotal,
        subTotal: dbSubTotal
    } = useSelector((state: RootState) => state.cart);

    // --- EFFECTS ---
    // If the user is authenticated, fetch their cart from the database.F
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCart());
        }
    }, [isAuthenticated, dispatch]);

    // --- UNIFIED EVENT HANDLERS ---
    // These adapt based on whether the user is logged in or not.
    const handleUpdateQuantity = (productId: string, skuVariant: string | undefined, newQuantity: number) => {
        if (isAuthenticated) {
            if (newQuantity > 0) {
                // For Redux, we need the cartItem._id to update quantity
                const cartItem = dbCartItems.find(item => 
                    skuVariant ? item.sku_variant === skuVariant : item.product._id === productId
                );
                if (cartItem) {
                    dispatch(updateCartQuantity({ cartItemId: cartItem._id, quantity: newQuantity }));
                }
            } else {
                // For Redux, we need the cartItem._id to remove it.
                const cartItem = dbCartItems.find(item => 
                    skuVariant ? item.sku_variant === skuVariant : item.product._id === productId
                );
                if (cartItem) {
                    dispatch(removeFromCart(cartItem._id));
                }
            }
        } else {
            updateLocalQuantity(productId, skuVariant, newQuantity);
        }
    };

    const handleRemoveFromCart = (id: string, productName: string, skuVariant?: string) => {
        if (isAuthenticated) {
            dispatch(removeFromCart(id)); // `id` is cartItem._id
        } else {
            removeFromLocalCart(id, skuVariant); // `id` is productId, skuVariant is optional
        }
        toast({
            title: "Item Removed",
            description: `${productName} has been removed from your cart.`,
        });
    };

    // --- DATA SELECTION LOGIC ---
    // Choose which data to display based on authentication status.
    const cartItems = isAuthenticated ? dbCartItems : localCartItems;
    const totalItems = isAuthenticated ? dbTotalItems : localTotalItems;
    const subTotal = isAuthenticated ? dbSubTotal : localTotalPrice;
    const finalTotal = isAuthenticated ? dbFinalTotal : localTotalPrice;

    // --- RENDER ---
    
    // View for an Empty Cart
    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-[var(--theme-background)]">
                <Navbar />
                <main className="container mx-auto px-4 py-24 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <ShoppingBag className="h-20 w-20 mx-auto mb-6 text-gray-300" />
                        <h1 className="text-3xl font-serif font-bold text-gray-800 mb-2">Your Bag is Empty</h1>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">Once you add something to your bag, it will appear here. Ready to find something you'll love?</p>
                        <Link href="/">
                            <Button className="bg-black text-white hover:bg-gray-800 px-8 py-6 rounded-full font-semibold text-lg shadow-lg transition-all duration-300 hover:scale-105">
                                Start Shopping
                            </Button>
                        </Link>
                    </motion.div>
                </main>
                <Footer />
            </div>
        )
    }

    // View for Cart with Items
    return (
        <div className="min-h-screen bg-[var(--theme-background)]">
            <Navbar />
            <main className="container mx-auto px-4 py-12">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition-colors">
                        <ArrowLeft size={16} /> Back to shopping
                    </Link>
                    <h1 className="text-4xl font-serif font-bold text-gray-800 mb-8">My Bag ({totalItems})</h1>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Item List Column */}
                    <div className="lg:col-span-2 bg-[var(--theme-card-background)] rounded-2xl shadow-sm p-6">
                        <div className="grid grid-cols-12 text-xs font-semibold text-gray-500 uppercase pb-4 border-b">
                            <div className="col-span-12 md:col-span-6">Product</div>
                            <div className="col-span-6 md:col-span-3 text-center">Quantity</div>
                            <div className="col-span-6 md:col-span-3 text-right">Total</div>
                        </div>
                        <AnimatePresence>
                            {cartItems.map((item: any, index) => (
                                <div key={isAuthenticated ? item._id : (item.sku_variant || item.productId)} className={index !== cartItems.length - 1 ? 'border-b' : ''}>
                                    <CartItemCard 
                                        item={item} 
                                        onUpdate={handleUpdateQuantity} 
                                        onRemove={handleRemoveFromCart}
                                        isGuestCart={!isAuthenticated}
                                    />
                                </div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary Column */}
                    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-1">
                        <div className="bg-[var(--theme-card-background)] rounded-2xl shadow-sm p-6 sticky top-28">
                            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">Order Summary</h2>
                            <div className="space-y-3 mb-6 text-gray-700">
                                <div className="flex justify-between items-center"><span className="text-gray-500">Subtotal</span><span className="font-semibold">₹{subTotal.toLocaleString()}</span></div>
                                {/* <div className="flex justify-between items-center"><span className="text-gray-500">Shipping</span><span className="font-semibold text-green-600">FREE</span></div> */}
                            </div>
                            <div className="border-t pt-4 mb-6">
                                <div className="flex justify-between items-center text-lg font-bold text-gray-800">
                                    <span>Estimated Total</span>
                                    <span>₹{subTotal.toLocaleString()}</span>
                                </div>
                            </div>
                            <Link href={isAuthenticated ? "/checkout" : "/login?redirect=/checkout"}>
                                <Button className="w-full h-12 rounded-lg font-bold text-base bg-[var(--primary-button-theme)] text-white hover:bg-[var(--primary-button-hover-theme)]">
                                    <Lock size={16} className="mr-2" />
                                    Proceed to Checkout
                                </Button>
                            </Link>
                            <div className="text-center mt-6">
                                <p className="text-xs text-gray-500 mb-2">We accept:</p>
                                <div className="flex justify-center items-center gap-3">
                                    <CreditCard size={20} className="text-gray-400" />
                                    <p className="text-xs text-gray-400">Visa, Mastercard, Amex, UPI</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
