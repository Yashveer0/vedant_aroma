// wishlistSlice.tsx
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store'; 
// import { Product } from '@/lib/data'; 
import apiClient from '@/lib/api/auth'; 

interface WishlistItemBackend {
  _id: string; 
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  base_price?: number;
  images: string[];
  stock_quantity: number;
  variants?: Array<{
    size: string;
    color: string;
    price: number;
    sale_price?: number;
    stock_quantity: number;
    sku_variant: string;
    images?: string[];
    _id: string;
  }>;
  category?: string;
  brand?: string;
  gender?: string;
  tags?: string[];
  fit?: string;
  careInstructions?: string;
  sleeveLength?: string;
  neckType?: string;
  pattern?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WishlistState {
  items: WishlistItemBackend[];
  totalItems: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  totalItems: 0,
  status: 'idle',
  error: null,
};

export const fetchWishlist = createAsyncThunk<WishlistItemBackend[], void, { state: RootState }>(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/users/wishlist'); 
      return response.data.data; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addToWishlist = createAsyncThunk<WishlistItemBackend[], string, { state: RootState }>(
  'wishlist/addToWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/users/wishlist', { productId }); 
       (response.data.data)
      return response.data.data; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeFromWishlist = createAsyncThunk<WishlistItemBackend[], string, { state: RootState }>(
  'wishlist/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(`/users/wishlist/${productId}`); 
      return response.data.data; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const mergeWishlist = createAsyncThunk<WishlistItemBackend[], string[], { state: RootState }>(
  'wishlist/mergeWishlist',
  async (productIds, { rejectWithValue }) => {
    try {
      // Backend mein naye merge endpoint ko call karein
      const response = await apiClient.post('/users/wishlist/merge', { productIds }); 
      return response.data.data; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to merge wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.status = 'idle';
      state.error = null;
    },
    addWishlistOptimistic: (state, action: PayloadAction<WishlistItemBackend>) => {
      if (!state.items.some(item => item._id === action.payload._id)) {
        state.items.push(action.payload);
        state.totalItems = state.items.length;
      }
    },
    removeWishlistOptimistic: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item._id !== action.payload);
      state.totalItems = state.items.length;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.totalItems = action.payload.length;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(addToWishlist.pending, (state) => {
        state.status = 'loading'; 
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.totalItems = action.payload.length;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(removeFromWishlist.pending, (state) => {
        state.status = 'loading'; 
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.totalItems = action.payload.length;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(mergeWishlist.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload; // Update the state with the merged list
        state.totalItems = action.payload.length;
      })
      .addCase(mergeWishlist.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearWishlist, addWishlistOptimistic, removeWishlistOptimistic } = wishlistSlice.actions;

export const selectWishlistItems = (state: RootState) => state.wishlist.items;
export const selectWishlistStatus = (state: RootState) => state.wishlist.status;
export const selectWishlistError = (state: RootState) => state.wishlist.error;
export const selectTotalWishlistItems = (state: RootState) => state.wishlist.items.length;
export const selectIsAddedToWishlist = (productId: string) => (state: RootState) =>
  state.wishlist.items.some(item => item._id === productId);

export default wishlistSlice.reducer;