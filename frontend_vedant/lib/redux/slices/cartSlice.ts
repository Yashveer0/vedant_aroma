// cartSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import apiClient from '@/lib/api/auth'; 
import { fetchTaxConfig } from './taxSlice';
import { fetchWalletConfig } from './adminSlice';
import { getCouponByNameApi, type WalletConfig } from '@/lib/api/admin';
import { RootState } from '../store';
import { resolveMediaUrl, resolveMediaUrls } from '@/lib/media';

// Coupon interface - matching API response exactly
export interface Coupon {
  _id: string;
  code: string;
  discountPercentage: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

// --- Interface Definitions ---
export interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    type?: string;
    weight?: number;
    images?: string[];
  };
  sku_variant: string;
  quantity: number;
  price: number;
  image?: string;
  attributes?: Record<string, string>; 
  type?:string;
  userInputInstructions?: string;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  appliedPoints: number;
  totalItems: number;
  subTotal: number;
  taxAmount: number;
  taxRate: number;

  isShippingLoading: boolean;      // To show a loader for shipping cost
  shippingPrice: number | null;    // The price fetched from API (can be null)
  shippingCost: number; 

  // shippingCost: number;
  discountAmount: number; // Total discount (points + coupon)
  couponDiscount: number; // Separate coupon discount for display
  pointsDiscount: number; // Separate points discount for display
  finalTotal: number;
  rupeesPerPoint: number;
  appliedCoupon: Coupon | null;
}

// --- Initial State ---
const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
  appliedPoints: 0,
  totalItems: 0,
  subTotal: 0,
  taxAmount: 0,
  taxRate: 0,

  isShippingLoading: false,
  shippingPrice: null,
  shippingCost: 0, 

  discountAmount: 0,
  couponDiscount: 0,
  pointsDiscount: 0,
  finalTotal: 0,
  rupeesPerPoint: 1,
  appliedCoupon: null, 
};

const normalizeCartItem = (item: CartItem): CartItem => {
  const product = item.product || ({} as CartItem["product"]);
  const productImages = resolveMediaUrls(product.images);

  return {
    ...item,
    image: resolveMediaUrl(item.image || productImages[0]),
    product: {
      ...product,
      images: productImages,
    },
  };
};

const normalizeCartItems = (items?: CartItem[] | null) =>
  (items || []).map((item) => normalizeCartItem(item));

// --- Async Thunks ---

export const fetchCart = createAsyncThunk<CartItem[], void, { rejectValue: string }>(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/users/cart');
      return normalizeCartItems(response.data.data);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addToCart = createAsyncThunk<CartItem[], { productId: string; sku_variant?: string; quantity: number }, { rejectValue: string }>(
  'cart/addToCart',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/users/cart', params);
      return normalizeCartItems(response.data.data);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const removeFromCart = createAsyncThunk<CartItem[], string, { rejectValue: string }>(
  'cart/removeFromCart',
  async (cartItemId, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(`/users/cart/item/${cartItemId}`);
      return normalizeCartItems(response.data.data);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

export const updateCartQuantity = createAsyncThunk<CartItem[], { cartItemId: string; quantity: number }, { rejectValue: string }>(
  'cart/updateQuantity',
  async ({ cartItemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`/users/cart/item/quantity/${cartItemId}`, { quantity });
      return normalizeCartItems(response.data.data);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to update cart quantity');
    }
  }
);

export const mergeCarts = createAsyncThunk<CartItem[], { productId: string, sku_variant: string, quantity: number }[], { rejectValue: string }>(
    'cart/mergeCarts',
    async (localCartItems, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/users/cart/merge', { items: localCartItems });
            return normalizeCartItems(response.data.data);
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            return rejectWithValue(err.response?.data?.message || 'Failed to merge carts');
        }
    }
);

// Apply Coupon Thunk - Fixed to match actual API response
export const applyCoupon = createAsyncThunk<
  Coupon,
  string,
  { rejectValue: string }
>(
  'cart/applyCoupon',
  async (couponCode, { rejectWithValue }) => {
    try {
      const response = await getCouponByNameApi(couponCode);
      console.log('Coupon API Response:', response.data);
      // API returns: { statusCode, data: {...coupon}, message, success }
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Invalid or expired coupon code');
    }
  }
);


export const calculateShippingCost = createAsyncThunk<
  { shippingPrice: number | null }, // Expected return type on success
  { delivery_postcode: string; cod?: boolean },   // Arguments passed to the thunk
  { rejectValue: string; state: RootState } // Define the state type for getState
>(
  'cart/calculateShippingCost',
  async ({ delivery_postcode, cod = false }, { getState, rejectWithValue }) => {
    try {
      // Get the current state to access the cart
      const state = getState();
      const items = state.cart.items;

      // Calculate total weight from all items in the cart
      const total_weight = items.reduce((total, item) => {
        // Use product weight, or a default (e.g., 0.5kg) if not provided
        const itemWeight = item.product?.weight || 0.5; 
        return total + (itemWeight * item.quantity);
      }, 0);

      // Ensure weight is at least the default value
      const weightToSend = total_weight > 0 ? total_weight : 0.5;

      const response = await apiClient.post('/shipping/serviceability', {
        delivery_postcode,
        cod,
        weight_in_kg: weightToSend, // <<< FIXED: Send the calculated weight
      });
      return response.data.data; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to calculate shipping cost');
    }
  }
);


const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearShippingPrice: (state) => {
      state.shippingPrice = null;
  },
    clearLocalCartState: (state) => {
        state.items = [];
        state.appliedPoints = 0;
        state.appliedCoupon = null;
        state.shippingPrice = null;
        state.shippingCost = 0;
        state.discountAmount = 0;
        state.couponDiscount = 0;
        state.pointsDiscount = 0;
        cartSlice.caseReducers.calculateTotals(state);
    },
    applyPoints: (state, action: PayloadAction<number>) => {
      state.appliedPoints = action.payload;
      cartSlice.caseReducers.calculateTotals(state); // Recalculate after applying
    },
    removePoints: (state) => {
      state.appliedPoints = 0;
      cartSlice.caseReducers.calculateTotals(state); // Recalculate after removing
    },
    removeCoupon: (state) => {
      state.appliedCoupon = null;
      cartSlice.caseReducers.calculateTotals(state);
    },
    calculateTotals: (state) => {
      const subTotal = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
      const totalItems = state.items.reduce((total, item) => total + item.quantity, 0);

      // 1. Calculate coupon discount from subtotal
      let couponDiscount = 0;
      if (state.appliedCoupon) {
        couponDiscount = (subTotal * state.appliedCoupon.discountPercentage) / 100;
      }

      // 2. Calculate points discount based on applied points and conversion rate
      const pointsDiscount = state.appliedPoints * state.rupeesPerPoint;

      // 3. Sum of all discounts
      const totalDiscount = couponDiscount + pointsDiscount;

      // 4. Calculate the base for tax (subtotal after all discounts)
      const taxableAmount = Math.max(0, subTotal - totalDiscount);
      
      // 5. Calculate tax
      const taxAmount = 0;
      
      // 6. Set shipping cost (can be made dynamic later)
      // const shippingCost = 90;
      const shippingCost = state.shippingPrice || 0;
      
      // 7. Calculate the final payable amount
      const finalTotal = taxableAmount + shippingCost + taxAmount;

      // 8. Update the entire state
      state.subTotal = subTotal;
      state.totalItems = totalItems;
      state.couponDiscount = couponDiscount;
      state.pointsDiscount = pointsDiscount;
      state.discountAmount = totalDiscount;
      state.shippingCost = shippingCost;
      state.taxAmount = taxAmount;
      state.finalTotal = finalTotal;
    },
  },
  extraReducers: (builder) => {
    builder
    .addCase(fetchWalletConfig.fulfilled, (state, action: PayloadAction<WalletConfig>) => {
      state.rupeesPerPoint = action.payload.rupeesPerPoint || 1;
      cartSlice.caseReducers.calculateTotals(state); // Recalculate if rate changes
    })
      .addCase(fetchTaxConfig.fulfilled, (state, action: PayloadAction<number>) => {
        state.taxRate = action.payload;
        cartSlice.caseReducers.calculateTotals(state);
      })
      // Handle coupon application - FIXED
      .addCase(applyCoupon.pending, (state) => {
          state.loading = true;
          state.error = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action: PayloadAction<Coupon>) => {
          console.log('Coupon applied in Redux:', action.payload);
          state.appliedCoupon = action.payload;
          state.loading = false;
          state.error = null;
          cartSlice.caseReducers.calculateTotals(state);
      })
      .addCase(applyCoupon.rejected, (state, action) => {
          console.log('Coupon application failed:', action.payload);
          state.loading = false;
          state.error = action.payload || 'Failed to apply coupon';
      })

      .addCase(calculateShippingCost.pending, (state) => {
        state.isShippingLoading = true;
        state.shippingPrice = null;
        cartSlice.caseReducers.calculateTotals(state); 
      })
      .addCase(calculateShippingCost.fulfilled, (state, action) => {
        state.isShippingLoading = false;
        state.shippingPrice = action.payload.shippingPrice;
        cartSlice.caseReducers.calculateTotals(state); 
      })
      .addCase(calculateShippingCost.rejected, (state, action) => {
        state.isShippingLoading = false;
        state.error = action.payload as string;
        state.shippingPrice = null;
        cartSlice.caseReducers.calculateTotals(state);
      })
      .addMatcher(
        (action) => action.type.startsWith('cart/') && 
                    action.type.endsWith('/pending') && 
                    action.type !== applyCoupon.pending.type &&
                    action.type !== calculateShippingCost.pending.type, 
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('cart/') && 
                    action.type.endsWith('/rejected') && 
                    action.type !== applyCoupon.rejected.type &&
                    action.type !== calculateShippingCost.rejected.type,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )
      .addMatcher(
        (action) => 
          action.type.startsWith('cart/') && 
          action.type.endsWith('/fulfilled') &&
          action.type !== applyCoupon.fulfilled.type &&
          action.type !== fetchWalletConfig.fulfilled.type &&
          action.type !== fetchTaxConfig.fulfilled.type &&
          action.type !== calculateShippingCost.fulfilled.type,
        (state, action: PayloadAction<CartItem[]>) => {
          state.loading = false;  
          state.items = action.payload;
          cartSlice.caseReducers.calculateTotals(state);
        }
      );
  },
});

export const { clearLocalCartState, applyPoints, removePoints, removeCoupon, calculateTotals } = cartSlice.actions;

export default cartSlice.reducer;
