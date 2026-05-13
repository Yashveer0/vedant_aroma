"use client"
import React, { useEffect, useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { fetchWalletConfig } from "@/lib/redux/slices/adminSlice"

// --- UI Components & Hooks ---
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, CreditCard, Shield, MapPin, PlusCircle, CheckCircle, Loader2, Home, Briefcase, Gift, Tag } from "lucide-react"

// --- Redux Imports ---
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@/lib/redux/store"
import { fetchCart, clearLocalCartState, applyPoints, removePoints, applyCoupon, removeCoupon,calculateShippingCost } from "@/lib/redux/slices/cartSlice"
// import isShippingLoading from "@/lib/redux/slices/cartSlice"
// import shippingPrice from "@/lib/redux/slices/cartSlice"
import { fetchUserProfile, addUserAddress, NewAddressPayload, type Address } from "@/lib/redux/slices/userSlice"
import { placeCodOrder, createRazorpayOrder, verifyRazorpayPayment } from "@/lib/redux/slices/orderSlice"
import { ServiceInfoForm } from "@/components/ServiceInfoForm";
import { selectIsAuthenticated } from "@/lib/redux/slices/authSlice"
import { fetchTaxConfig } from "@/lib/redux/slices/taxSlice"
import { useCart as useLocalCart } from "@/context/CartContext"
import { resolveMediaUrl } from "@/lib/media"

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, any>) => {
      open: () => void;
      on: (eventName: string, callback: (response: any) => void) => void;
    };
  }
}

// Custom hook to load external scripts like Razorpay
const useScript = (src: string) => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existingScript) {
      setStatus(existingScript.dataset.loaded === 'true' || window.Razorpay ? 'ready' : 'loading');
      const handleLoad = () => setStatus('ready');
      const handleError = () => setStatus('error');
      existingScript.addEventListener('load', handleLoad);
      existingScript.addEventListener('error', handleError);
      return () => {
        existingScript.removeEventListener('load', handleLoad);
        existingScript.removeEventListener('error', handleError);
      };
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      setStatus('ready');
    };
    script.onerror = () => setStatus('error');
    document.body.appendChild(script);
  }, [src]);

  return status;
};

export default function CheckoutPage() {
  const razorpayScriptStatus = useScript("https://checkout.razorpay.com/v1/checkout.js");
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const { clearCart: clearLocalCart } = useLocalCart();

  // --- Read all data directly from Redux slices ---
  const { items, subTotal, shippingCost, discountAmount, finalTotal, appliedPoints, taxAmount, appliedCoupon, couponDiscount, pointsDiscount,rupeesPerPoint ,loading: cartLoading, isShippingLoading, shippingPrice } = useSelector((state: RootState) => state.cart);
  const { user, addresses, status: userStatus } = useSelector((state: RootState) => state.user)
  const { walletConfig } = useSelector((state: RootState) => state.admin);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  

  // Get user wallet points and wallet config
  const userWalletPoints = user?.wallet || 0;

  const { isServiceInCart, isPhysicalProductInCart } = useMemo(() => {
    const isService = items.some(item => item.product.type === 'service');
    const isPhysical = items.some(item => item.product.type === 'product');
    return { isServiceInCart: isService, isPhysicalProductInCart: isPhysical };
  }, [items]);
  
  // Get wallet configuration from admin settings
  const walletSettings = useMemo(() => {
    if (!walletConfig) return null;
    const firstRule = walletConfig.rewardRules?.[0];
    return {
      minSpend: firstRule?.minSpend || 1000,
      pointsAwarded: firstRule?.pointsAwarded || 10,
      rupeesPerPoint: walletConfig.rupeesPerPoint || 1
    };
  }, [walletConfig]);

  // --- Local UI State ---
  
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cod' | 'razorpay'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pointsInput, setPointsInput] = useState("");
  const [isApplyingPoints, setIsApplyingPoints] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [serviceInputs, setServiceInputs] = useState<Record<string, string>>({});

  const clearCompletedCart = () => {
    dispatch(clearLocalCartState());
    clearLocalCart();
  };



  // const isServiceInCart = useMemo(() => {
   // // The .some() method is efficient as it stops searching once it finds a match.
  //   return items.some(item => item.product.type === 'service');
  // }, [items]);

  const initialAddressFormState = useMemo(() => ({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    street: "", city: "", state: "", postalCode: "", type: "Home" as const,
  }), [user]);

  const [newAddressFormData, setNewAddressFormData] = useState<NewAddressPayload>(initialAddressFormState);

  // const { shippingPrice, finalCheckoutTotal } = useMemo(() => {
  //   const shippingPrice = 90;
  //   const finalCheckoutTotal = finalTotal;
  //   return { shippingPrice, finalCheckoutTotal };
  // }, [finalTotal]);

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchTaxConfig());
      dispatch(fetchCart());
      dispatch(fetchUserProfile());
      dispatch(fetchWalletConfig());
    }
  }, [dispatch, isAuthenticated]);

  // Set default selected address once addresses are loaded
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddress._id);
    }
  }, [addresses, selectedAddressId]);



  // Pre-fill new address form when user data is available
  useEffect(() => {
    if (isPhysicalProductInCart && selectedAddressId) {
        const selectedAddress = addresses.find(addr => addr._id === selectedAddressId);
        if (selectedAddress?.postalCode) {
            dispatch(calculateShippingCost({
              delivery_postcode: selectedAddress.postalCode,
              cod: selectedPaymentMethod === 'cod',
            }));
        }
    }
  }, [selectedAddressId, addresses, dispatch, isPhysicalProductInCart, selectedPaymentMethod]);

  useEffect(() => {
    if (isServiceInCart && selectedPaymentMethod === 'cod') {
      setSelectedPaymentMethod('razorpay');
    }
  }, [isServiceInCart, selectedPaymentMethod]);

  // Redirect if cart is empty after loading
  useEffect(() => {
    if (!cartLoading && items.length === 0) {
      toast({ title: "Your cart is empty!", description: "Redirecting you to the cart page..." });
      const timer = setTimeout(() => router.push('/cart'), 2000);
      return () => clearTimeout(timer);
    }
  }, [items.length, cartLoading, router, toast]);

  const handleNewAddressInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewAddressFormData({ ...newAddressFormData, [e.target.name]: e.target.value });
  };

  const handleAddNewAddress = async () => {
    const requiredFields: (keyof NewAddressPayload)[] = ['fullName', 'phone', 'street', 'city', 'state', 'postalCode'];
    if (requiredFields.some(field => !newAddressFormData[field])) {
      toast({ title: "Please fill all required fields.", variant: "destructive" });
      return;
    }

    try {
      const addedAddresses: Address[] = await dispatch(addUserAddress(newAddressFormData)).unwrap();
      toast({ title: "Address added successfully!" });
      setShowNewAddressForm(false);
      setNewAddressFormData(initialAddressFormState);
      if (addedAddresses && addedAddresses.length > 0) {
        setSelectedAddressId(addedAddresses[addedAddresses.length - 1]._id);
      }
    } catch (err: any) {
      toast({
        title: "Failed to add address",
        description: String(err),
        variant: "destructive"
      });
    }
  };

  // Points application handlers
  const handleApplyPoints = async () => {
    const pointsToApply = parseInt(pointsInput);

    if (!pointsInput.trim() || isNaN(pointsToApply) || pointsToApply <= 0) {
      toast({
        title: "Invalid Points",
        description: "Please enter a valid number of points.",
        variant: "destructive"
      });
      return;
    }

    if (pointsToApply > userWalletPoints) {
      toast({
        title: "Insufficient Points",
        description: `You only have ${userWalletPoints} points available.`,
        variant: "destructive"
      });
      return;
    }

    const couponValue = appliedCoupon ? (subTotal * Number(appliedCoupon.discountPercentage || 0)) / 100 : 0;
    const maxPointsValue = Math.max(0, subTotal - couponValue);
    const rupeesPerPointValue = walletSettings?.rupeesPerPoint || rupeesPerPoint || 1;
    const maxPointsToApply = Math.floor(maxPointsValue / rupeesPerPointValue);
    
    if (maxPointsToApply <= 0) {
      toast({
        title: "Points Not Applicable",
        description: "This coupon already covers the redeemable product value.",
        variant: "destructive"
      });
      return;
    }

    const pointsToRedeem = Math.min(pointsToApply, maxPointsToApply);

    setIsApplyingPoints(true);
    try {
      dispatch(applyPoints(pointsToRedeem));
      setPointsInput("");
      
      const discountAmount = pointsToRedeem * rupeesPerPointValue;
      
      toast({
        title: "Points Applied",
        description:
          pointsToRedeem < pointsToApply
            ? `${pointsToRedeem} points applied after coupon discount.`
            : `${pointsToRedeem} points (Rs ${discountAmount}) applied to your order.`,
      });
    } finally {
      setIsApplyingPoints(false);
    }
  };

  const handleRemovePoints = () => {
    dispatch(removePoints());
    toast({
      title: "Points Removed",
      description: "Points discount has been removed from your order.",
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({ title: "Please enter a coupon code.", variant: "destructive" });
      return;
    }
    setIsApplyingCoupon(true);
    try {
      await dispatch(applyCoupon(couponCode)).unwrap();
      toast({ 
        title: "Coupon Applied Successfully!", 
        description: `${couponCode} has been applied to your order.` 
      });
      setCouponCode("");
    } catch (error: any) {
      toast({ 
        title: "Failed to apply coupon", 
        description: error || "Invalid or expired coupon code", 
        variant: "destructive" 
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    toast({ 
      title: "Coupon Removed", 
      description: "Coupon discount has been removed from your order." 
    });
  };

  const serviceItemsInCart = useMemo(() => {
    return items.filter(item => item.product.type === 'service');
  }, [items]);


const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validate shipping address ONLY if physical products are present
    if (isPhysicalProductInCart) {
      if (!selectedAddressId) {
        toast({ title: "Please select a shipping address.", variant: "destructive" });
        return;
      }
      if (shippingPrice === null) {
        toast({ title: "Address Not Serviceable", description: "Sorry, we cannot deliver to the selected address.", variant: "destructive" });
        return;
      }
    }

    // 2. Validate service details ONLY if services are present
    if (isServiceInCart) {
      for (const item of serviceItemsInCart) {
        if (!serviceInputs[item._id] || serviceInputs[item._id].trim() === '') {
          toast({ title: "Information Required", description: `Please provide required details for "${item.product.name}".`, variant: "destructive" });
          return;
        }
      }
    }

    setIsProcessing(true);
    
    // 3. Conditionally build the order payload
    const orderDetails: any = { 
      couponCode: appliedCoupon?.code,
      pointsToRedeem: appliedPoints,
      serviceInputs: isServiceInCart ? serviceInputs : undefined,
      // Only include shipping details if physical products exist
      addressId: isPhysicalProductInCart ? selectedAddressId : undefined,
    };
    
    const getSuccessUrl = (orderId: string) => `/order-success?orderId=${orderId}${isServiceInCart ? '&service_ordered=true' : ''}`;

    // 4. Handle payment and order creation
    if (selectedPaymentMethod === 'cod' && !isServiceInCart) { // COD only for non-service orders
      try {
        const result = await dispatch(placeCodOrder(orderDetails)).unwrap();
        clearCompletedCart();
        router.push(getSuccessUrl(result.order._id));
        toast({ title: "Order placed successfully!" });
      } catch (error: any) {
        toast({ title: "Order Failed", description: error, variant: "destructive" });
      } finally {
        setIsProcessing(false);
      }
    } else { // Razorpay for services or prepaid physical goods
      try {
        if (razorpayScriptStatus !== 'ready' || !window.Razorpay) {
          throw new Error("Payment gateway is still loading. Please try again in a moment.");
        }

        const razorpayOrder = await dispatch(createRazorpayOrder(orderDetails)).unwrap();
        const options = {
          key: razorpayOrder.key,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency || "INR",
          name: "Vedant Gurukul Aroma",
          description: "Order Payment",
          order_id: razorpayOrder.orderId,
          handler: async (response: any) => {
            try {
              const result = await dispatch(verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })).unwrap();
              clearCompletedCart();
              router.push(getSuccessUrl(result.order._id));
              toast({ title: "Payment Successful, Order Placed!" });
            } catch (verifyError: any) {
              toast({ title: "Payment Verification Failed", description: verifyError, variant: "destructive" });
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: { name: user?.fullName, email: user?.email, contact: user?.phone },
          theme: { color: "#000000" },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
            },
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
          setIsProcessing(false);
          toast({
            title: 'Payment Failed',
            description: response.error?.description || 'Your payment could not be completed.',
            variant: 'destructive',
          });
        });
        rzp.open();
      } catch (error: any) {
        toast({ title: "Payment Initiation Failed", description: error.message || error, variant: "destructive" });
        setIsProcessing(false);
      }
    }
  };



  if (cartLoading || userStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0 && !cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4">
          <h2 className="text-2xl font-semibold">Your cart is empty.</h2>
          <p>Redirecting you back to the cart...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center space-x-4 mb-8">
          <Link href="/cart" className="p-2 rounded-full hover:bg-gray-200"><ArrowLeft /></Link>
          <h1 className="text-3xl font-serif font-bold">Checkout</h1>
        </motion.div>

        <form onSubmit={handleSubmitOrder} className="grid lg:grid-cols-2 gap-12">
          {/* Left Column: Shipping and Payment */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-6">1. Shipping Information</h2>

              {addresses && addresses.length > 0 ? (
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Select Shipping Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        className={`relative p-4 border rounded-xl cursor-pointer transition-all ${selectedAddressId === address._id
                            ? 'border-black ring-2 ring-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-400'
                          }`}
                        onClick={() => setSelectedAddressId(address._id)}
                      >
                        {selectedAddressId === address._id && (
                          <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-black" />
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold">{address.fullName}</p>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{address.type}</span>
                            {address.isDefault && (
                              <span className="text-xs bg-black text-white px-2 py-1 rounded">Default</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{address.street}</p>
                          <p className="text-sm text-gray-600">{address.city}, {address.state} - {address.postalCode}</p>
                          <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2"><MapPin className="h-5 w-5 text-yellow-600" /><h3 className="font-medium text-yellow-800">No Shipping Address Found</h3></div>
                  <p className="text-sm text-yellow-700 mb-4">Please add a shipping address to continue.</p>
                </div>
              )}


              <div className="mb-8">
                <Button type="button" variant="outline" className="w-full" onClick={() => setShowNewAddressForm(!showNewAddressForm)}>
                  <PlusCircle className="h-5 w-5 mr-2" />
                  {showNewAddressForm ? "Cancel" : "Add New Address"}
                </Button>

                <AnimatePresence>
                  {showNewAddressForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 p-6 border rounded-2xl bg-gray-50 space-y-4 overflow-hidden">
                      <h4 className="font-medium text-lg mb-4">Add New Address</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label htmlFor="fullName">Full Name *</Label><Input id="fullName" name="fullName" value={newAddressFormData.fullName} onChange={handleNewAddressInputChange} /></div>
                        <div className="space-y-2"><Label htmlFor="phone">Phone *</Label><Input id="phone" name="phone" type="tel" maxLength={10} value={newAddressFormData.phone} onChange={handleNewAddressInputChange} /></div>
                      </div>
                      <div className="space-y-2"><Label htmlFor="street">Street Address *</Label><Input id="street" name="street" value={newAddressFormData.street} onChange={handleNewAddressInputChange} /></div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2"><Label htmlFor="state">State *</Label><Input id="state" name="state" value={newAddressFormData.state} onChange={handleNewAddressInputChange} /></div>
                        <div className="space-y-2"><Label htmlFor="city">City *</Label><Input id="city" name="city" value={newAddressFormData.city} onChange={handleNewAddressInputChange} /></div>
                        <div className="space-y-2"><Label htmlFor="postalCode">PIN Code *</Label><Input id="postalCode" name="postalCode" maxLength={6} value={newAddressFormData.postalCode} onChange={handleNewAddressInputChange} /></div>
                      </div>
                      <div className="space-y-2 pt-2">
                        <Label>Address Type</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <Button type="button" variant={newAddressFormData.type === 'Home' ? 'default' : 'outline'} onClick={() => handleNewAddressInputChange({ target: { name: 'type', value: 'Home' } } as React.ChangeEvent<HTMLSelectElement>)} className="flex items-center justify-center py-6"><Home className="mr-2 h-4 w-4" />Home</Button>
                          <Button type="button" variant={newAddressFormData.type === 'Work' ? 'default' : 'outline'} onClick={() => handleNewAddressInputChange({ target: { name: 'type', value: 'Work' } } as React.ChangeEvent<HTMLSelectElement>)} className="flex items-center justify-center py-6"><Briefcase className="mr-2 h-4 w-4" />Work</Button>
                        </div>
                      </div>
                      <Button type="button" className="w-full mt-4" onClick={handleAddNewAddress}>Save Address</Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {isServiceInCart && (
                   <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                   >
                     <ServiceInfoForm 
                        serviceItems={serviceItemsInCart}
                        user={user}
                        onInputChange={setServiceInputs}
                     />
                   </motion.div>
                )}
              </AnimatePresence>


              <div className="pt-6 border-t">
                <h2 className="text-xl font-semibold mb-6">
                   {isServiceInCart ? '4. Payment Method' : '2. Payment Method'}
                </h2>
                <div className="space-y-4">

                  <div onClick={() => setSelectedPaymentMethod('razorpay')} className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all ${selectedPaymentMethod === 'razorpay' ? 'border-black ring-2 ring-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}>
                    <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">R</div><span className="flex-1 font-medium">Pay Online (Razorpay)</span>{selectedPaymentMethod === 'razorpay' && <CheckCircle className="h-5 w-5 text-black" />}
                  </div>

                  {!isServiceInCart && (
                    <div onClick={() => setSelectedPaymentMethod('cod')} className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all ${selectedPaymentMethod === 'cod' ? 'border-black ring-2 ring-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}>
                      <CreditCard className="h-5 w-5 text-gray-500" /><span className="flex-1 font-medium">Cash on Delivery (COD)</span>{selectedPaymentMethod === 'cod' && <CheckCircle className="h-5 w-5 text-black" />}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Order Summary */}
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>

            
            <div className="bg-white rounded-2xl p-8 border shadow-sm sticky top-24">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item._id} className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      <Image src={resolveMediaUrl(item.image)} alt={item.product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium truncate">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <hr className="my-6" />

              {/* Wallet Points Section */}
              {isAuthenticated && userWalletPoints > 0 && (
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2"><Gift size={20} className="text-yellow-500" /><Label>Redeem Wallet Points</Label></div>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-600 mb-3">You have <span className="font-bold text-yellow-600">{userWalletPoints.toLocaleString()}</span> points available.</p>
                    
                    {appliedPoints > 0 ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Applied Points:</span>
                          <span className="font-semibold text-yellow-600">{appliedPoints.toLocaleString()}</span>
                        </div>
                        <Button type="button" onClick={handleRemovePoints} variant="outline" size="sm" className="w-full text-red-600 border-red-200 hover:bg-red-50">Remove Points</Button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Input type="number" placeholder="Enter points" value={pointsInput} onChange={(e) => setPointsInput(e.target.value)} disabled={isApplyingPoints} />
                        <Button type="button" onClick={handleApplyPoints} variant="outline" disabled={isApplyingPoints || !pointsInput.trim()}>
                          {isApplyingPoints ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Coupon Section */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Tag size={20} className="text-blue-500" />
                  <Label htmlFor="coupon">Apply Coupon</Label>
                </div>
                {appliedCoupon ? (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <div>
                        <span className="text-gray-600">Applied Coupon:</span>
                        <span className="font-semibold text-blue-600 ml-2">{appliedCoupon.code}</span>
                      </div>
                      <span className="font-semibold text-blue-600">-{appliedCoupon.discountPercentage}%</span>
                    </div>
                    <Button
                      type="button"
                      onClick={handleRemoveCoupon}
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Remove Coupon
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Input
                      id="coupon"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={isApplyingCoupon}
                    />
                    <Button
                      type="button"
                      onClick={handleApplyCoupon}
                      variant="outline"
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                    >
                      {isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{subTotal.toLocaleString()}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Coupon Discount ({appliedCoupon?.discountPercentage}%)</span>
                    <span>- ₹{couponDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}

                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-[#D09D13]">
                    <span>Points Discount</span>
                    <span>- ₹{pointsDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}

                {isPhysicalProductInCart && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    {isShippingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>{selectedAddressId && shippingPrice === null ? <span className="text-red-500 text-sm">Not Serviceable</span> : `₹${shippingCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>}
                  </div>
                )}

                {taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>₹{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}

                <hr className="my-4" />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-black">₹{finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* --- MODIFIED ---: Button is disabled if address is not serviceable */}
              <Button 
                type="submit" 
                disabled={
                  isProcessing ||
                  (isPhysicalProductInCart && isShippingLoading)
                }
                className="w-full py-3 h-12 mt-6 font-semibold text-base bg-black text-white hover:bg-gray-800"
              >
                {isProcessing ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>) : (`Place Order - ₹${finalTotal.toLocaleString()}`)}
              </Button>

              <div className="flex items-center justify-center space-x-2 mt-3 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Secure SSL Encrypted Payment</span>
              </div>
            </div>
          </motion.div>
        </form>
      </main>
      <Footer />
    </div>
  )
}
