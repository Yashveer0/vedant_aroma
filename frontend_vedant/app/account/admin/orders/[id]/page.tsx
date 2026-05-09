// app/admin/orders/[orderId]/page.tsx

"use client";
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { resolveMediaUrl } from '@/lib/media';
import type { RootState, AppDispatch } from '@/lib/redux/store';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingBag, Loader2, Save, User, Home, Truck, Send, PackageCheck, Hourglass, XCircle, CalendarClock } from 'lucide-react';
import { toast } from "sonner";

// --- Import actions and types from your slices ---
import { fetchSingleOrderAsAdmin, updateOrderStatus, Order } from '@/lib/redux/slices/orderSlice';
import { generateAWBForOrder, trackOrderById, clearTrackingData, TrackingScan, TrackingData,schedulePickup } from '@/lib/redux/slices/shippingSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";


// =================================================================
// --- REUSABLE CARD COMPONENTS ---
// =================================================================

const CustomerInfoCard = ({ user, address }: { user: Order['user'], address: Order['shippingAddress'] }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4 flex items-center"><User className="mr-2 h-5 w-5" /> Customer Details</h2>
    <div className="rounded-lg border bg-white p-6 text-sm">
      <p className="font-bold text-gray-800">{user.fullName}</p>
      <p className="text-gray-600">{user.email || 'No email provided'}</p>
      <hr className="my-3"/>
      {address&&<div className="space-y-1">
        <p className="font-semibold text-gray-700">Shipping Address</p>
        <p className="text-gray-600">{address.street}</p>
        <p className="text-gray-600">{address.city}, {address.state} - {address.postalCode}</p>
        <p className="text-gray-600 mt-2">Phone: {address.phone}</p>
      </div>}
    </div>
  </div>
);

const OrderSummaryCard = ({ order }: { order: Order }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
    <div className="rounded-lg border bg-white p-6 space-y-3 text-sm">
      <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">₹{order.itemsPrice.toLocaleString()}</span></div>
      <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span className="font-medium">₹{order.shippingPrice.toLocaleString()}</span></div>
      <div className="flex justify-between"><span className="text-gray-600">Tax</span><span className="font-medium">₹{order.taxPrice.toLocaleString()}</span></div>
      {order.discountAmount && order.discountAmount > 0 && (
        <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discountAmount.toLocaleString()}</span></div>
      )}
      {order.couponCode && (
        <div className="flex justify-between text-blue-600"><span>Coupon Code</span><span>{order.couponCode}</span></div>
      )}
      <hr className="my-2"/>
      <div className="flex justify-between font-bold text-base"><span>Total</span><span>₹{order.totalPrice.toLocaleString()}</span></div>
      <div className="flex justify-between text-xs text-gray-500 pt-2"><span>Payment Method</span><span>{order.paymentMethod}</span></div>
    </div>
  </div>
);

// --- NEW: Tracking Modal Content Component ---
const TrackingDetails = () => {
    const { trackingData, loading: isTrackingLoading, error } = useSelector((state: RootState) => state.shipping);
  
    if (isTrackingLoading) {
      return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;
    }
  
    if (error) {
      return (
        <div className="text-center h-40 flex flex-col justify-center items-center text-red-500">
            <XCircle className="h-8 w-8 mb-2" />
            <p className="font-semibold">Could not fetch tracking details.</p>
            <p className="text-sm">{error}</p>
        </div>
      );
    }
  
    if (!trackingData) {
      return <div className="text-center h-40 flex flex-col justify-center items-center"><p>No tracking information available.</p></div>;
    }

    if (trackingData.track_status === 0) {
        return (
            <div className="text-center py-8 px-4">
                <Hourglass className="h-10 w-10 mx-auto text-blue-500 mb-4" />
                <h3 className="font-bold text-lg text-gray-800">Order is Processing</h3>
                <p className="text-sm text-gray-500 mt-2">{trackingData.error || "Awaiting pickup by courier partner."}</p>
            </div>
        );
    }

    if (trackingData.track_status === 1 && trackingData.shipment_track_activities) {
        const scans = [...trackingData.shipment_track_activities].reverse();
        return (
            <div className="max-h-[60vh] overflow-y-auto pr-4">
                <div className="space-y-6">
                {scans.map((scan: TrackingScan, index: number) => (
                    <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full ${index === 0 ? 'bg-green-500 ring-4 ring-green-100' : 'bg-gray-300'}`}></div>
                        {index < scans.length - 1 && <div className="w-0.5 flex-grow bg-gray-300"></div>}
                    </div>
                    <div>
                        <p className={`font-semibold ${index === 0 ? 'text-gray-800' : 'text-gray-600'}`}>{scan.activity}</p>
                        <p className="text-sm text-gray-500">{scan.location}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(scan.date).toLocaleString()}</p>
                    </div>
                    </div>
                ))}
                </div>
            </div>
        );
    }
    
    return <div className="text-center h-40 flex flex-col justify-center items-center"><p>Could not display tracking information.</p></div>;
};

// --- NEW: Shipment Management Card Component ---
const ShipmentCard = ({ order }: { order: Order }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { isGeneratingAWB, isSchedulingPickup } = useSelector((state: RootState) => state.shipping);
    const [pickupScheduled, setPickupScheduled] = useState(false);

    const handleGenerateAWB = async () => {
        // The optional chaining (?.) is important for safety
        if (!order.shipmentDetails?.shiprocketShipmentId) {
            toast.error("Shiprocket Shipment ID is missing. Cannot generate AWB.");
            return;
        }
        try {
            await dispatch(generateAWBForOrder({ shipmentId: order.shipmentDetails.shiprocketShipmentId })).unwrap();
            toast.success("AWB generated successfully! Order is now marked as Shipped.");
        } catch (err: any) {
            toast.error(err || "Failed to generate AWB.");
        }
    };
    
    const handleTrackOrder = () => {
        dispatch(trackOrderById(order._id));
    };


    const handleSchedulePickup = async () => {
      if (!order.shipmentDetails?.shiprocketShipmentId) {
          toast.error("Shiprocket Shipment ID is missing.");
          return;
      }
      try {
          await dispatch(schedulePickup({ shipmentId: order.shipmentDetails.shiprocketShipmentId })).unwrap();
          toast.success("Pickup scheduled successfully! The courier will be notified.");
          setPickupScheduled(true); // Hide the button after successful scheduling
      } catch (err: any) {
          toast.error(err || "Failed to schedule pickup.");
      }
  }

    // Condition to show the "Generate AWB" button
    const canGenerateAWB = 
        order.shipmentDetails?.shiprocketShipmentId && 
        !order.shipmentDetails?.trackingNumber &&
        (order.orderStatus === 'Paid' || order.orderStatus === 'Processing');

    const canSchedulePickup =
    order.shipmentDetails?.trackingNumber && // AWB must exist
    !pickupScheduled && // And pickup should not have been scheduled in this session
    order.orderStatus === 'Shipped'; // The order status is 'Shipped' (logically means Ready to Ship)
    // Note: You could also check a more granular status from Shiprocket API if you stored it.
    return (order.shippingAddress && 
        <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center"><Truck className="mr-2 h-5 w-5" /> Shipment Actions</h2>
            <div className="rounded-lg border bg-white p-6 text-sm space-y-4">
                {canGenerateAWB && (
                    <Button onClick={handleGenerateAWB} disabled={isGeneratingAWB} className="w-full h-12 text-base">
                        {isGeneratingAWB ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Generate AWB & Ship
                    </Button>
                )}

                {order.shipmentDetails?.trackingNumber ? (
                    <div className="space-y-4">
                        <div>
                            <p className="text-gray-500">Courier</p>
                            <p className="font-semibold">{order.shipmentDetails.courier}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Tracking Number (AWB)</p>
                            <p className="font-semibold font-mono">{order.shipmentDetails.trackingNumber}</p>
                        </div>
                        {canSchedulePickup && (
                             <Button onClick={handleSchedulePickup} disabled={isSchedulingPickup} className="w-full bg-blue-600 hover:bg-blue-700">
                                {isSchedulingPickup ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarClock className="mr-2 h-4 w-4" />}
                                Schedule Pickup
                            </Button>
                        )}
                        <Dialog onOpenChange={(open) => !open && dispatch(clearTrackingData())}>
                            <DialogTrigger asChild>
                                <Button onClick={handleTrackOrder} variant="outline" className="w-full">
                                    <Truck className="mr-2 h-4 w-4" /> Track Live Status
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Live Shipment Tracking</DialogTitle>
                                    <DialogDescription>Updates for AWB #{order.shipmentDetails.trackingNumber}</DialogDescription>
                                </DialogHeader>
                                <TrackingDetails />
                            </DialogContent>
                        </Dialog>
                    </div>
                ) : (
                    !canGenerateAWB && <p className="text-gray-500 text-center">This order is not ready for shipment yet or has already been shipped.</p>
                )}
            </div>
        </div>
    );
};

// =================================================================
// --- MAIN PAGE COMPONENT ---
// =================================================================
export default function AdminOrderDetailsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();

  const orderId = params.id as string;

  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const { currentOrder: order, loading, error } = useSelector((state: RootState) => state.order);
  const { user: adminUser } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (adminUser && adminUser.role !== 'admin') {
      router.push('/login');
    } else if (adminUser && orderId) {
      dispatch(fetchSingleOrderAsAdmin(orderId));
    }
  }, [adminUser, router, orderId, dispatch]);

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.orderStatus);
    }
  }, [order]);

  const handleStatusUpdate = async () => {
    if (!order || selectedStatus === order.orderStatus) {
      toast.info("No changes to save.");
      return;
    }
    
    setIsUpdating(true);
    try {
      await dispatch(updateOrderStatus({ orderId: order._id, status: selectedStatus })).unwrap();
      toast.success("Order status has been updated successfully.");
    } catch (err: any) {
      toast.error(err || "Failed to update the order status.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading && !order) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
        <h1 className="mt-4 text-2xl font-bold">Order Not Found</h1>
        <p className="text-gray-600">{error || "We couldn't find an order with that ID."}</p>
        <Button asChild className="mt-6"><Link href="/account/admin/orders">Back to All Orders</Link></Button>
      </div>
    );
  }

  const orderStatuses = ["Pending", "Paid", "Processing", "Shipped", "Delivered", "Cancelled"];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/account/admin/orders" className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
            <ArrowLeft size={16} className="mr-2" />
            Back to All Orders
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order #{order._id}</h1>
              <p className="text-gray-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <Badge className="mt-2 sm:mt-0 text-base">{order.orderStatus}</Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-lg border bg-white p-6">
              <h2 className="text-xl font-semibold mb-4">Update Order Status</h2>
              <div className="flex items-center gap-4">
                <Select value={selectedStatus} onValueChange={setSelectedStatus} disabled={order.orderStatus === 'Shipped'}>
                  <SelectTrigger><SelectValue placeholder="Select a status..." /></SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map(status => (
                      <SelectItem key={status} value={status} disabled={status === 'Shipped'}>
                          {status} {status === 'Shipped' && '(Auto)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleStatusUpdate} disabled={isUpdating || selectedStatus === order.orderStatus}>
                  {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Status
                </Button>
              </div>
               {order.orderStatus !== 'Shipped' && <p className="text-xs text-gray-500 mt-2">'Shipped' status is set automatically when AWB is generated.</p>}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Items in this order ({order.orderItems.length})</h2>
              <div className="space-y-4 rounded-lg border bg-white">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border-b last:border-b-0">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                      <Image 
                        src={resolveMediaUrl(item.image || item.product_id?.images?.[0])}
                        alt={item.product_name || item.name || 'Product'} 
                        fill 
                        sizes="80px"
                        className="object-cover" 
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-800">{item.product_name || item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                      {item.color && <p className="text-sm text-gray-500">Color: {item.color}</p>}
                    </div>
                    <p className="font-semibold text-gray-900">
                      ₹{(item.price_per_item || item.price || 0).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <ShipmentCard order={order} />
            <CustomerInfoCard user={order.user} address={order.shippingAddress} />
            <OrderSummaryCard order={order} />
          </div>
        </div>
      </div>
    </div>
  );
}
