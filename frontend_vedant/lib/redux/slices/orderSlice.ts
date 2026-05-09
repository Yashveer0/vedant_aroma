import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import apiClient from '@/lib/api/auth'; // Axios instance for USER routes with auth
import adminApiClient from '@/lib/api/adminClient'; // Axios instance for ADMIN routes
import { generateAWBForOrder } from './shippingSlice'; 

// =================================================================
// --- TYPE DEFINITIONS ---
// =================================================================

export interface OrderItem {
  _id: string;
  name: string; // Fallback name stored at time of order
  product_name?: string; // Another fallback
  quantity: number;
  price: number; // Fallback price stored at time of order
  price_per_item?: number; // More specific historical price
  image: string;
  sku_variant?: string;
  // This 'product_id' object is populated by your backend API call
  product_id?: {
    _id: string;
    name: string; // The most up-to-date product name
    slug: string;
    price: number; // The most up-to-date price
    images: string[];
  };
  // The 'product' field might be used by other parts of your app, so we keep it
  product?: {
    _id: string;
    slug: string;
    images: string[];
  };
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface Order {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    email?: string;
    images?:string[];
  };
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  discountAmount?: number;
  couponCode?: string;
  totalPrice: number;
  orderStatus: 'Pending' | 'Paid' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: 'COD' | 'Razorpay';
  paymentId?: string;
  razorpayOrderId?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  paidAt?: string;
  createdAt: string;
  
  // --- FIX APPLIED HERE ---
  // Added the shipmentDetails object to match your backend model.
  // It's optional because it only exists for shipped orders.
  shipmentDetails?: {
    shiprocketShipmentId?: string;
    shiprocketOrderId?: string;
    trackingNumber?: string;
    courier?: string;
    trackingUrl?: string;
    status?: string;
    pickupStatus?: string;
    lastError?: string;
    awbAssignedAt?: string;
    pickupScheduledAt?: string;
  };
  
  cancellationDetails?: {
    cancelledBy: 'User' | 'Admin';
    reason: string;
    cancellationDate: string;
  };
  refundDetails?: {
    refundId: string;
    amount: number;
    status: string;
    createdAt: string;
  };
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
  };
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
  },
};

// =================================================================
// --- ASYNC THUNKS ---
// =================================================================

// --- User-specific Thunks ---

export const fetchMyOrders = createAsyncThunk<
  any, // The backend now returns a pagination object { orders, currentPage, ... }
  { page?: number; limit?: number },
  { rejectValue: string }
>(
  'orders/fetchMyOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Pass the page and limit as query parameters
      const response = await apiClient.get('/users/orders', { params });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your orders');
    }
  }
);

export const fetchSingleOrderAsAdmin = createAsyncThunk<Order, string, { rejectValue: string }>(
  'orders/fetchSingleOrderAsAdmin',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/admin/orders/${orderId}`);
      return response.data.data;
    } catch (error: any){
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order details for admin');
    }
  }
);

export const fetchSingleOrder = createAsyncThunk<Order, string, { rejectValue: string }>(
  'orders/fetchSingleOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      // This can be used by both user and admin, so we use the user route by default
      const response = await apiClient.get(`/users/orders/${orderId}`);
         (response.data.data) 
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order details');
    }
  }
);

export const placeCodOrder = createAsyncThunk<
  { order: Order },
  { couponCode?: string; addressId?: string | null; pointsToRedeem?: number },
  { rejectValue: string }
>(
  'orders/placeCodOrder',
  async ({ addressId, couponCode, pointsToRedeem }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/users/order/cod', { addressId, couponCode, pointsToRedeem });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to place COD order');
    }
  }
);

export const createRazorpayOrder = createAsyncThunk<
  { orderId: string; amount: number; currency: string; key: string; receipt: string; checkout?: any },
  {
    addressId?: string | null;
    couponCode?: string;
    pointsToRedeem?: number;
    serviceInputs?: Record<string, string>;
  },
  { rejectValue: string }
>(
  'orders/createRazorpayOrder',
  async (params, { rejectWithValue }) => {
    try {
      // Payment routes are separate, so we use a direct axios call
      const response = await apiClient.post(`/payment/create-order`, params);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create Razorpay order');
    }
  }
);

export const verifyRazorpayPayment = createAsyncThunk<
  { order: Order },
  { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string },
  { rejectValue: string }
>(
  'orders/verifyRazorpayPayment',
  async (params, { rejectWithValue, getState }) => {
    try {
        
      
      // Debug: Check if token is available
      const state = getState() as any;
      const accessToken = state.auth?.accessToken;
      
      // Manually add token to headers as a fallback
      const config = {
        headers: accessToken ? {
          'Authorization': `Bearer ${accessToken}`
        } : {}
      };
      
      const response = await apiClient.post(`/payment/verify`, params, config);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Payment verification failed');
    }
  }
);


// --- Admin-specific Thunks ---

export const fetchAllOrders = createAsyncThunk<
  any, // Backend returns a pagination object
  { page?: number; limit?: number; searchQuery?: string }, 
  { rejectValue: string }
>(
  'orders/fetchAllOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/admin/orders/all', { params });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all orders');
    }
  }
);

export const cancelOrderAsAdmin = createAsyncThunk<Order, { orderId: string; reason?: string }, { rejectValue: string }>(
  'orders/cancelOrderAsAdmin',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/payment/${orderId}/cancel`, { reason });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

export const cancelOrder = createAsyncThunk<
  Order, // It returns the updated order object on success
  { orderId: string; reason?: string }, // It takes orderId and an optional reason
  { rejectValue: string }
>(
  'orders/cancelOrder',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      // We use a PATCH request as defined in the backend controller
      const response = await apiClient.patch(`users/orders/cancel/${orderId}`, { reason });
      return response.data.data; // The backend returns the updated order
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel the order.');
    }
  }
);


export const updateOrderStatus = createAsyncThunk<
  Order, // Returns the updated order
  { orderId: string; status: string },
  { rejectValue: string }
>(
  'orders/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`/admin/orders/${orderId}/status`, { status });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);


// =================================================================
// --- ORDER SLICE ---
// =================================================================

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- fetchMyOrders (User) ---
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.orders = action.payload.orders;
        // Store the pagination data from the API response
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalOrders: action.payload.totalOrders,
        };
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- fetchAllOrders (Admin) ---
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalOrders: action.payload.totalOrders,
        };
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- fetchSingleOrder (User & Admin) ---
      .addCase(fetchSingleOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentOrder = null;
      })
      .addCase(fetchSingleOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchSingleOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(fetchSingleOrderAsAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentOrder = null;
      })
      .addCase(fetchSingleOrderAsAdmin.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchSingleOrderAsAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // --- Order Creation ---
      .addCase(placeCodOrder.pending, (state) => { state.loading = true; })
      .addCase(placeCodOrder.fulfilled, (state, action: PayloadAction<{ order: Order }>) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
        state.orders.unshift(action.payload.order);
      })
      .addCase(placeCodOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      
      .addCase(createRazorpayOrder.pending, (state) => { state.loading = true; })
      .addCase(createRazorpayOrder.fulfilled, (state) => { state.loading = false; })
      .addCase(createRazorpayOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      
      .addCase(verifyRazorpayPayment.pending, (state) => { state.loading = true; })
      .addCase(verifyRazorpayPayment.fulfilled, (state, action: PayloadAction<{ order: Order }>) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
        state.orders.unshift(action.payload.order);
      })
      .addCase(verifyRazorpayPayment.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

      // --- updateOrderStatus (Admin) ---
      .addCase(updateOrderStatus.pending, (state) => {
        // We don't set global loading to true to keep the UI responsive
      })
      .addCase(updateOrderStatus.fulfilled, (state, action: PayloadAction<Order>) => {
        const updatedOrder = action.payload;
        if (state.currentOrder?._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }
        const index = state.orders.findIndex(order => order._id === updatedOrder._id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(cancelOrderAsAdmin.pending, (state) => {
        // Optional: you can set a specific loading state for this action
      })
      .addCase(cancelOrderAsAdmin.fulfilled, (state, action: PayloadAction<Order>) => {
        const updatedOrder = action.payload;
        const index = state.orders.findIndex(order => order._id === updatedOrder._id);
        if (index !== -1) {
          state.orders[index] = updatedOrder; // Update the order in the list
        }
        if (state.currentOrder?._id === updatedOrder._id) {
          state.currentOrder = updatedOrder; // Also update if it's the currently viewed order
        }
      })
      .addCase(cancelOrderAsAdmin.rejected, (state, action) => {
        // The component will show a toast with this error
        state.error = action.payload as string;
      })
      .addCase(cancelOrder.pending, (state) => {
        // We don't set a global loading state to keep the UI responsive.
        // The button itself can show a loading spinner.
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        const updatedOrder = action.payload;
        
        // Find the index of the cancelled order in the orders list
        const index = state.orders.findIndex(order => order._id === updatedOrder._id);
        
        // If found, update it in the list
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }

        // If the cancelled order is the one currently being viewed, update it too
        if (state.currentOrder?._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        // The component will show a toast with this error message.
        state.error = action.payload as string;
      })
      .addCase(generateAWBForOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        const updatedOrder = action.payload;
        // If the updated order is the one we're currently viewing, update it
        if (state.currentOrder?._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }
        // Also update it in the main list of orders if it exists
        const index = state.orders.findIndex(order => order._id === updatedOrder._id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
      });
  },
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
