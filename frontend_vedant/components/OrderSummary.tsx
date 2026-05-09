"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { useToast } from '@/hooks/use-toast';

// --- UI Components ---
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Gift, Tag, Shield } from 'lucide-react';

// --- Redux Imports ---
import { RootState, AppDispatch } from '@/lib/redux/store';
import { applyPoints, removePoints, applyCoupon, removeCoupon } from "@/lib/redux/slices/cartSlice";
import { resolveMediaUrl } from '@/lib/media';

interface OrderSummaryProps {
  isProcessing: boolean;
  finalTotalForButton: number; // Receive finalTotal as a prop for the button
}

export function OrderSummary({ isProcessing, finalTotalForButton }: OrderSummaryProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  // --- Select ONLY the state needed for this component from Redux ---
  const { items, subTotal, taxAmount, shippingCost, couponDiscount, pointsDiscount, appliedCoupon, appliedPoints, finalTotal } = useSelector((state: RootState) => state.cart);
  const userWalletPoints = useSelector((state: RootState) => state.user.user?.wallet || 0);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // --- Local state for this component ---
  const [pointsInput, setPointsInput] = useState("");
  const [isApplyingPoints, setIsApplyingPoints] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // --- Handlers are now inside this component ---
  const handleApplyPoints = async () => {
    // ... (Your existing handleApplyPoints logic)
    const pointsToApply = parseInt(pointsInput);
    if (isNaN(pointsToApply) || pointsToApply <= 0) {
      toast({ title: "Invalid Points", variant: "destructive" });
      return;
    }
    if (pointsToApply > userWalletPoints) {
      toast({ title: "Insufficient Points", description: `You only have ${userWalletPoints} points.`, variant: "destructive" });
      return;
    }
    setIsApplyingPoints(true);
    try {
      await dispatch(applyPoints(pointsToApply));
      toast({ title: "Points Applied" });
      setPointsInput("");
    } finally {
      setIsApplyingPoints(false);
    }
  };

  const handleRemovePoints = () => {
    dispatch(removePoints());
    toast({ title: "Points Removed" });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({ title: "Please enter a coupon code.", variant: "destructive" });
      return;
    }
    setIsApplyingCoupon(true);
    try {
      await dispatch(applyCoupon(couponCode)).unwrap();
      toast({ title: "Coupon Applied Successfully!" });
      setCouponCode("");
    } catch (error: any) {
      toast({ title: "Failed to apply coupon", description: error, variant: "destructive" });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    toast({ title: "Coupon Removed" });
  };

  return (
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
                <div className="flex justify-between items-center text-sm"><span className="text-gray-600">Applied Points:</span><span className="font-semibold text-yellow-600">{appliedPoints.toLocaleString()}</span></div>
                <Button type="button" onClick={handleRemovePoints} variant="outline" size="sm" className="w-full text-red-600 border-red-200 hover:bg-red-50">Remove Points</Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Input type="number" placeholder="Enter points" value={pointsInput} onChange={(e) => setPointsInput(e.target.value)} disabled={isApplyingPoints} />
                <Button type="button" onClick={handleApplyPoints} variant="outline" disabled={isApplyingPoints || !pointsInput.trim()}>{isApplyingPoints ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Coupon Section */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2"><Tag size={20} className="text-blue-500" /><Label htmlFor="coupon">Apply Coupon</Label></div>
        {appliedCoupon ? (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center text-sm mb-2">
              <div><span className="text-gray-600">Applied Coupon:</span><span className="font-semibold text-blue-600 ml-2">{appliedCoupon.code}</span></div>
              <span className="font-semibold text-blue-600">-{appliedCoupon.discountPercentage}%</span>
            </div>
            <Button type="button" onClick={handleRemoveCoupon} variant="outline" size="sm" className="w-full mt-3 text-red-600 border-red-200 hover:bg-red-50">Remove Coupon</Button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Input id="coupon" placeholder="Enter coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} disabled={isApplyingCoupon} />
            <Button type="button" onClick={handleApplyCoupon} variant="outline" disabled={isApplyingCoupon || !couponCode.trim()} className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500">{isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}</Button>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3">
        <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>₹{subTotal.toLocaleString()}</span></div>
        {couponDiscount > 0 && <div className="flex justify-between text-blue-600"><span>Coupon Discount ({appliedCoupon?.discountPercentage}%)</span><span>- ₹{couponDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>}
        {pointsDiscount > 0 && <div className="flex justify-between text-[#D09D13]"><span>Points Discount</span><span>- ₹{pointsDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>}
        <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>₹{shippingCost.toLocaleString()}</span></div>
        {taxAmount > 0 && <div className="flex justify-between"><span className="text-gray-600">Tax</span><span>₹{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>}
        <hr className="my-4" />
        <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-black">₹{finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
      </div>

      <Button type="submit" disabled={isProcessing} className="w-full py-3 h-12 mt-6 font-semibold text-base bg-black text-white hover:bg-gray-800">
        {isProcessing ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>) : (`Place Order - ₹${finalTotalForButton.toLocaleString()}`)}
      </Button>

      <div className="flex items-center justify-center space-x-2 mt-3 text-sm text-gray-600">
        <Shield className="h-4 w-4" /><span>Secure SSL Encrypted Payment</span>
      </div>
    </div>
  );
}
