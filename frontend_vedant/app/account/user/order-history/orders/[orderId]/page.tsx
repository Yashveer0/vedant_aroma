"use client";
import { useEffect, useRef, useState } from 'react'; // Import useRef
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { RootState, AppDispatch } from '@/lib/redux/store';
import Navbar  from '@/components/Navbar';
import Footer  from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, ShoppingBag, Home, Truck, FileDown, XCircle, RefreshCw, PackageCheck, Hourglass } from 'lucide-react';

import { fetchSingleOrder,cancelOrder ,Order } from '@/lib/redux/slices/orderSlice';
import { toast } from 'sonner';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription
} from "@/components/ui/dialog";
import { clearTrackingData, TrackingScan, trackOrderById } from '@/lib/redux/slices/shippingSlice';

// ===================================================================================
// 1. DEDICATED PRINT STYLESHEET COMPONENT
// This CSS hides everything on the page EXCEPT for the invoice when= printing.
// ===================================================================================
const PrintStyles = () => (
  <style jsx global>{`
    @media print {
      .no-print { display: none !important; }
      .print-only { display: block !important; }
      #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; }
      body {
        background-color: white !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `}</style>
);

// ===================================================================================
// 2. VISUAL INVOICE COMPONENT
// Renders the invoice design.
// ===================================================================================
const InvoiceTemplate = ({ order }: { order: Order }) => {
  const companyDetails = {
    name: 'vedantgurukularoma',
    address: 'abcd noida',
    gstin: '07BATPS3910H1ZC',
    contact: '+91 99xxxxx',
    email: 'vedantgurukularoma@.com',
    website: 'www.vedantgurukularoma.org',
    logo: '/vedantgurukularoma-PNG.png'
  };

  return (
    <div id="printable-invoice" className="hidden print-only">
        <div className="w-[800px] bg-white p-4 font-sans mx-auto">
            <div className="flex items-center justify-between bg-black text-white p-6">
                <div className="w-40">
                    <Image src={companyDetails.logo} alt="vedantgurukularoma Logo" width={150} height={42} className="brightness-0 invert"/>
                </div>
                <h1 className="text-4xl font-bold tracking-wider">INVOICE</h1>
            </div>
            <div className="grid grid-cols-2 gap-8 p-6 text-sm">
                <div>
                    <h2 className="font-bold text-lg mb-1">{companyDetails.name}</h2>
                    <p className="text-xs leading-snug">{companyDetails.address}</p>
                    <p className="text-xs">GSTIN: {companyDetails.gstin}</p>
                    <p className="text-xs">Contact: {companyDetails.contact}</p>
                    <p className="text-xs">Website: {companyDetails.website}</p>
                </div>
                <div className="text-right">
                    <p><span className="font-bold">Invoice #:</span> {order._id.slice(-8).toUpperCase()}</p>
                    <p><span className="font-bold">Order Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p><span className="font-bold">Status:</span> {order.orderStatus}</p>
                </div>
            </div>
            {order.shippingAddress && (
              <div className="px-6 pb-6 text-sm">
                  <h3 className="font-bold mb-1">Billed To:</h3>
                  <p>{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
              </div>
            )}

            <div className="px-6">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-black text-white">
                            <th className="p-2 text-left w-12">#</th>
                            <th className="p-2 text-left">Product</th>
                            <th className="p-2 text-right">Qty x Price</th>
                            <th className="p-2 text-right">Total (INR)</th>
                        </tr>
                    </thead>
                    <tbody>
                    {order.orderItems.map((item, index) => {
                // --- FIX APPLIED HERE: Logic to safely get name and price ---
                      const productName = item.product_id?.name ?? item.product_name ?? 'N/A';
                      const pricePer = item.price_per_item ?? item.price;
                      return (
                        <tr key={index} className="border-b">
                          <td className="p-2">{index + 1}</td>
                          <td className="p-2">{productName}</td>
                          <td className="p-2 text-right">{item.quantity} x ₹{pricePer.toLocaleString()}</td>
                          <td className="p-2 text-right">₹{(item.quantity * pricePer).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
            </div>
            <div className="grid grid-cols-2 p-6 mt-4">
                <div className="text-xs text-gray-600">
                    <p className="font-bold mb-1">Note:</p>
                    <p>This is a computer-generated invoice.</p>
                    <p>For support, contact us at {companyDetails.contact} or email {companyDetails.email}</p>
                </div>
                <div className="text-right space-y-1 text-sm">
                    <p><span className="font-semibold">Subtotal:</span> ₹{order.itemsPrice.toLocaleString()}</p>
                   {order.discountAmount && <p><span className="font-semibold">Discount:</span> ₹{order.discountAmount.toLocaleString()}</p>}
                   {order.shippingPrice > 0 && <p><span className="font-semibold">Shipping:</span> ₹{order.shippingPrice.toLocaleString()}</p>}
                    <p><span className="font-semibold">Tax (Included):</span> ₹{order.taxPrice.toLocaleString()}</p>
                    <p className="font-bold text-base mt-2"><span className="font-bold">Grand Total:</span> ₹{order.totalPrice.toLocaleString()}</p>
                </div>
            </div>
            <div className="text-center p-6 mt-2">
                <p className="font-bold text-purple-800">Thank you for your business!</p>
                <p className="text-sm text-gray-500">{companyDetails.website}</p>
            </div>
        </div>
    </div>
  );
};

// =================================================================
// --- NEW INFO CARD COMPONENTS (For Cancelled Orders) ---
// =================================================================

const CancellationInfoCard = ({ details }: { details: Order['cancellationDetails'] }) => {
  if (!details) return null;

  return (
      <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center text-red-600"><XCircle className="mr-2 h-5 w-5" /> Order Cancelled</h2>
          <div className="rounded-lg border bg-white p-6 text-sm">
              <div className="space-y-2">
                  <p><span className="font-semibold text-gray-700">Cancelled By:</span> {details.cancelledBy}</p>
                  <p><span className="font-semibold text-gray-700">Reason:</span> {details.reason}</p>
                  <p><span className="font-semibold text-gray-700">Date:</span> {new Date(details.cancellationDate).toLocaleString()}</p>
              </div>
          </div>
      </div>
  );
};

// =================================================================
const TrackingDetails = () => {
  const { trackingData, loading, error } = useSelector((state: RootState) => state.shipping);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
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
    return (
      <div className="text-center h-40 flex flex-col justify-center items-center">
          <p>No tracking information available.</p>
      </div>
    );
  }

  // --- THIS IS THE NEW LOGIC ---
  // Case 1: Tracking data exists, but status is 0 (Awaiting Pickup)
  if (trackingData.track_status === 0) {
      return (
          <div className="text-center py-8 px-4">
              <Hourglass className="h-10 w-10 mx-auto text-blue-500 mb-4" />
              <h3 className="font-bold text-lg text-gray-800">Order is Processing</h3>
              <p className="text-sm text-gray-500 mt-2">
                  {/* Display the friendly message from Shiprocket */}
                  {trackingData.error || "Your order has been confirmed and is waiting to be picked up by our courier partner."}
              </p>
              <p className="text-xs text-gray-400 mt-4">Tracking details will be updated here as soon as the first scan is complete.</p>
          </div>
      );
  }

  // Case 2: Tracking data exists, and status is 1 (In Transit, Delivered, etc.)
  // We also check if there are any activities to display.
  if (trackingData.track_status === 1 && trackingData.shipment_track_activities) {
      // Reverse the scans to show the latest activity on top
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
  
  // Fallback case if data is in an unexpected format
  return (
      <div className="text-center h-40 flex flex-col justify-center items-center">
          <p>Could not display tracking information.</p>
      </div>
  );
};


const RefundInfoCard = ({ details }: { details: Order['refundDetails'] }) => {
  if (!details) return null;

  return (
      <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center text-blue-600"><RefreshCw className="mr-2 h-5 w-5" /> Refund Status</h2>
          <div className="rounded-lg border bg-white p-6 text-sm">
              <div className="space-y-2">
                  <p className="font-bold text-gray-800">A refund of ₹{details.amount.toLocaleString()} has been processed.</p>
                  <div><span className="font-semibold text-gray-700">Status:</span> <Badge variant="secondary">{details.status}</Badge></div>
                  <p className="text-xs text-gray-500">Refund ID: {details.refundId}</p>
                  <p className="text-xs text-gray-500 pt-2">Please allow 5-7 business days for the amount to reflect in your account.</p>
              </div>
          </div>
      </div>
  );
};


// =================================================================
// --- REUSABLE CARD COMPONENTS ---
// =================================================================
const ShippingInfoCard = ({ address }: { address?: Order['shippingAddress'] }) => {
  if (!address) {
    return null; // Don't render anything if there's no address
  }
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 flex items-center"><Home className="mr-2 h-5 w-5" /> Shipping Address</h2>
      <div className="rounded-lg border bg-white p-6 text-sm">
        <div className="space-y-1">
          <p className="font-bold text-gray-800">{address.fullName}</p>
          <p className="text-gray-600">{address.street}</p>
          <p className="text-gray-600">{address.city}, {address.state} - {address.postalCode}</p>
          <p className="text-gray-600 mt-2">Phone: {address.phone}</p>
        </div>
      </div>
    </div>
  );
};


const OrderSummaryCard = ({ order }: { order: Order }) => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
    <div className="rounded-lg border bg-white p-6 space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium">₹{order.itemsPrice.toLocaleString()}</span>
      </div>

      {order.discountAmount && order.discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
              <span className="font-medium">Discount</span>
              <span>-₹{order.discountAmount.toLocaleString()}</span>
          </div>
      )}
      
      <div className="flex justify-between">
        <span className="text-gray-600">Shipping</span>
        <span className="font-medium">₹{order.shippingPrice.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Tax</span>
        <span className="font-medium">₹{order.taxPrice.toLocaleString()}</span>
      </div>
      <hr className="my-2"/>
      <div className="flex justify-between font-bold text-base">
        <span>Total</span>
        <span>₹{order.totalPrice.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-xs text-gray-500 pt-2">
        <span>Payment Method</span>
        <span>{order.paymentMethod}</span>
      </div>
    </div>
  </div>
);

// =================================================================
// --- MAIN PAGE COMPONENT ---
// =================================================================
export default function UserOrderDetailsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;

  const { currentOrder: order, loading, error } = useSelector((state: RootState) => state.order);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isCancelling, setIsCancelling] = useState(false)


  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (orderId) {
      dispatch(fetchSingleOrder(orderId));
    }
  }, [isAuthenticated, router, orderId, dispatch]);

  const handleDownloadInvoice = () => {
    window.print();
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    setIsCancelling(true);
    try {
      await dispatch(cancelOrder({ orderId: order._id })).unwrap();
      toast.success("Your order has been cancelled successfully.");
    } catch (err: any) {
      toast.error(err || "Failed to cancel the order. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleTrackOrder = () => {
    if (order) {
      dispatch(trackOrderById(order._id));
    }
  };

  // const containsPhysicalProduct = order?.orderItems.some(item => item?.product_type === 'product');
  const isCancellable = order && !['Shipped', 'Delivered', 'Cancelled'].includes(order.orderStatus);
  

  // const isTrackable = order && ['Shipped', 'Delivered'].includes(order.orderStatus);
  const isTrackable = !!order?.shipmentDetails?.trackingNumber;



  if (loading && !order) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex flex-col items-center justify-center text-center h-[70vh]">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-400" />
            <h1 className="mt-4 text-3xl font-bold">Order Not Found</h1>
            <p className="text-gray-600 mt-2">{error || "We couldn't find an order with that ID."}</p>
            <Button asChild className="mt-6">
                <Link href="/account/user/order-history">Back to Order History</Link>
            </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <PrintStyles />
      {order && <InvoiceTemplate order={order} />}

      <div className="min-h-screen bg-gray-50 no-print">
          <Navbar />
          <main className="container mx-auto max-w-4xl px-4 py-12">
              <div className="mb-8">
              <Link href="/account/user/order-history" className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Order History
              </Link>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Order #{order._id}</h1>
                    <p className="text-gray-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <Badge className="mt-2 sm:mt-0 text-base">{order.orderStatus}</Badge>
              </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* --- ACTION BUTTONS ADDED HERE --- */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {order.shippingAddress && (
                <Dialog onOpenChange={(open) => !open && dispatch(clearTrackingData())}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-center py-6 text-base" disabled={!isTrackable} onClick={handleTrackOrder}>
                      <Truck size={18} className="mr-2" />
                      Track Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Shipment Tracking</DialogTitle>
                      <DialogDescription>Live updates for your order.</DialogDescription>
                    </DialogHeader>
                    <TrackingDetails />
                  </DialogContent>
                </Dialog>
                )}

                    <Button 
                        variant="outline" 
                        className="w-full justify-center py-6 text-base"
                        onClick={handleDownloadInvoice}
                    >
                        <FileDown size={18} className="mr-2" />
                        Download Invoice
                    </Button>

                    {/* --- NEW: CANCEL ORDER BUTTON WITH DIALOG --- */}
                    {isCancellable && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full justify-center py-6 text-base sm:col-span-2">
                                    {isCancelling ? (
                                        <Loader2 size={18} className="mr-2 animate-spin" />
                                    ) : (
                                        <XCircle size={18} className="mr-2" />
                                    )}
                                    Cancel Order
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. If you've already paid, a refund will be initiated automatically.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>No, Keep It</AlertDialogCancel>
                                <AlertDialogAction onClick={handleCancelOrder}>
                                    Yes, Cancel Order
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">Items in your order ({order.orderItems.length})</h2>
                    <div className="space-y-4 rounded-lg border bg-white">
                    {order.orderItems.map((item) => {
                    // --- FIX APPLIED HERE: Logic to safely get name and price ---
                    const productName = item.product_id?.name ?? item.product_name ?? 'N/A';
                    const pricePer = item.price_per_item ?? item.price;
                    return (
                      <div key={item._id} className="flex items-center space-x-4 p-4 border-b last:border-b-0">
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                          <Image src={item.image || '/placeholder.svg'} alt={productName} fill sizes="80px" className="object-cover" />
                        </div>
                        <div className="flex-grow">
                          <p className="font-semibold text-gray-800">{productName}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-900">₹{pricePer.toLocaleString()}</p>
                      </div>
                    );
                  })}
                    </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-8">
                  <ShippingInfoCard address={order.shippingAddress} />
                  <OrderSummaryCard order={order} />
              </div>
              <div className="lg:col-span-1 space-y-8">
              {order.orderStatus === 'Cancelled' && (
                      <>
                          <CancellationInfoCard details={order.cancellationDetails} />
                          <RefundInfoCard details={order.refundDetails} />
                      </>
                  )}
                  <ShippingInfoCard address={order.shippingAddress} />
                  <OrderSummaryCard order={order} />
              </div>
              </div>
          </main>
          <Footer />
      </div>
    </>
  );
}