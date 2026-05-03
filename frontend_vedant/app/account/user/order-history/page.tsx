"use client";
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { RootState, AppDispatch } from '@/lib/redux/store';
import  Navbar  from '@/components/Navbar';
import  Footer  from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Loader2, CircleCheck, RefreshCw, Truck, XCircle, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';

import { fetchMyOrders, Order } from '@/lib/redux/slices/orderSlice';

// A map to associate status with an icon and color
const statusStyles: { [key: string]: { icon: React.ElementType, color: string } } = {
  Delivered: { icon: CircleCheck, color: 'text-green-600' },
  Processing: { icon: RefreshCw, color: 'text-yellow-600' },
  Paid: { icon: RefreshCw, color: 'text-yellow-600' },
  Shipped: { icon: Truck, color: 'text-blue-600' },
  Cancelled: { icon: XCircle, color: 'text-red-600' },
  Pending: { icon: RefreshCw, color: 'text-gray-500' },
};

const OrderCard = ({ order }: { order: Order }) => {
  const style = statusStyles[order.orderStatus] || statusStyles['Pending'];
  const StatusIcon = style.icon;

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b bg-gray-50 p-4">
        <div>
          <p className="text-sm font-bold text-gray-800">Order #{order._id}</p>
          <p className="text-xs text-gray-500">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div className={`flex items-center text-sm font-semibold ${style.color}`}>
          <StatusIcon size={16} className="mr-2" />
          {order.orderStatus}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center space-x-4">
          {order.orderItems && order.orderItems.length > 0 && (
            <div className="flex -space-x-4">
              {order.orderItems.slice(0, 3).map((item, index) => (
                <div key={item._id || index} className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow">
                  <Image 
                    // --- FIX 1: 'item.product_name' ka istemal karein ---
                    alt={item.product_name? item.product_name: ""} 
                    // --- FIX 2: 'item.image' ka istemal karein ---
                    src={item.image || '/placeholder.svg'} 
                    fill 
                    sizes="64px"
                    className="object-cover" 
                  />
                </div>
              ))}
            </div>
          )}
          <div className="flex-grow">
            <h3 className="font-semibold text-gray-800">
              {/* --- FIX 3: 'item.product_name' ka istemal karein --- */}
              {order.orderItems[0]?.product_name || 'Order Item'}
              {/* --- FIX 4: Text ko theek karein --- */}
              {order.orderItems.length > 1 && ` + ${order.orderItems.length - 1} more item(s)`}
            </h3>
            <p className="text-sm text-gray-500">Total: <span className="font-bold text-gray-900">₹{order.totalPrice.toLocaleString()}</span></p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/account/user/order-history/orders/${order._id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function MyOrdersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { orders, loading, error, pagination } = useSelector((state: RootState) => state.order);
  
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/login');
    } else if (isAuthenticated === true) {
      dispatch(fetchMyOrders({ page: currentPage, limit: 5 }));
    }
  }, [isAuthenticated, router, dispatch, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto flex items-center justify-center text-center h-[70vh]">
                <div>
                    <h2 className="text-xl font-semibold text-red-600">Failed to load orders</h2>
                    <p className="text-sm text-gray-500">{error}</p>
                    <Button onClick={() => dispatch(fetchMyOrders({ page: currentPage, limit: 5 }))} className="mt-4">
                        Try Again
                    </Button>
                </div>
            </main>
            <Footer />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">My Orders</h1>
        
        {Array.isArray(orders) && orders.length > 0 ? (
          <>
            <div className="space-y-6">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>

            {/* --- THIS IS THE FIX --- */}
            {/* The pagination controls are now rendered inside the conditional block */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-end space-x-2 py-4 mt-8">
                  <span className="text-sm text-muted-foreground">
                      Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1 || loading}
                  >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                  </Button>
                  <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= pagination.totalPages || loading}
                  >
                      Next
                      <ChevronRight className="h-4 w-4" />
                  </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center rounded-lg border-2 border-dashed border-gray-300 p-12 mt-8">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-xl font-medium text-gray-900">No orders yet</h2>
            <p className="mt-1 text-sm text-gray-500">Looks like you haven't made any purchases with us.</p>
            <Button asChild className="mt-6">
              <Link href="/">Start Shopping</Link>
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}


