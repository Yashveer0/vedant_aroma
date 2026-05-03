import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Product, Review } from '@/lib/types/product';
import { toast } from 'sonner';
import apiClient from '@/lib/api/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
  : 'http://localhost:8000/api/v1';

// --- Type Definitions ---

interface ProductQueryParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  category?: string;
  gender?: string;
  tags?: string;
  [key: string]: any;
}

interface ProductState {
  items: Product[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  loading: boolean;
  error: string | null;
  selectedProduct: Product | null;
  productDetailsLoading: boolean;
  productDetailsError: string | null;
  searchResults: Product[]; 
  searchLoading: boolean; 
}

// --- Initial State ---

const initialState: ProductState = {
  items: [],
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,
  loading: true,
  error: null,
  selectedProduct: null,
  productDetailsLoading: false,
  productDetailsError: null,
  searchResults: [],
  searchLoading: false,
};

interface CreateReviewParams {
  productId: string;
  rating: number;
  comment: string;
  images?: File[]; // Optional array of files
}

// --- Async Thunks for Products ---

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (queryParams: ProductQueryParams = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
      const response = await axios.get(`${API_BASE_URL}/products?${params.toString()}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchSearchResults = createAsyncThunk(
  'products/fetchSearchResults',
  async (queryParams: { search: string; limit?: number }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
      const response = await axios.get(`${API_BASE_URL}/products?${params.toString()}`);
      return response.data.data.products; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  "products/fetchProductBySlug",
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/slug/${slug}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch product");
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${id}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch product");
    }
  }
);

// --- Async Thunks for Reviews ---

export const createProductReview = createAsyncThunk(
  'products/createProductReview',
  async ({ productId, rating, comment, images }: { productId: string; rating: number; comment: string; images?: File[] }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('rating', String(rating));
      formData.append('comment', comment);
      if (images && images.length > 0) {
        images.forEach(file => formData.append('images', file));
      }
      
      // THIS CALL NOW AUTOMATICALLY INCLUDES COOKIES / AUTH HEADER
      const response = await apiClient.post(`/reviews/product/${productId}`, formData);
      toast.success("Review submitted successfully!");
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to submit review';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteProductReview = createAsyncThunk(
  'products/deleteProductReview',
  async ({ productId, reviewId }: { productId: string, reviewId: string }, { rejectWithValue }) => {
    try {
      // THIS CALL NOW AUTOMATICALLY INCLUDES COOKIES / AUTH HEADER
      await apiClient.delete(`/reviews/${reviewId}`);
      toast.success("Your review has been deleted.");
      return { productId, reviewId };
    } catch (error: any) {
       const errorMessage = error.response?.data?.message || 'Failed to delete review';
       toast.error(errorMessage);
       return rejectWithValue(errorMessage);
    }
  }
);
// --- Slice Definition ---

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
      state.productDetailsError = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // --- fetchProducts ---
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products || [];
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalProducts = action.payload.totalProducts;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // --- fetchProductBySlug ---
      .addCase(fetchProductBySlug.pending, (state) => {
        state.productDetailsLoading = true;
        state.productDetailsError = null;
        state.selectedProduct = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action: PayloadAction<Product>) => {
        state.productDetailsLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.productDetailsLoading = false;
        state.productDetailsError = action.payload as string;
      })
      
      // --- fetchSearchResults ---
      .addCase(fetchSearchResults.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(fetchSearchResults.rejected, (state) => {
        state.searchLoading = false;
        state.searchResults = [];
      })
      
      // --- createProductReview ---
      .addCase(createProductReview.pending, (state) => {
        // Optionally, you can show a loading state on the review form
      })
      .addCase(createProductReview.fulfilled, (state, action: PayloadAction<Product>) => {
        // The backend returns the full product with the updated reviews array.
        // We just need to replace the selectedProduct with this new data.
        if (state.selectedProduct && state.selectedProduct._id === action.payload._id) {
          state.selectedProduct = action.payload;
        }
      })
      .addCase(createProductReview.rejected, (state, action) => {
        // Error is already shown via toast in the thunk
      })

      // --- deleteProductReview ---
      .addCase(deleteProductReview.fulfilled, (state, action: PayloadAction<{ productId: string, reviewId: string }>) => {
        if (state.selectedProduct && state.selectedProduct._id === action.payload.productId) {
          // Manually update the reviews array and stats
          const reviews = state.selectedProduct.reviews ?? [];
          state.selectedProduct.reviews = reviews.filter(
            (review) => review._id !== action.payload.reviewId
          );
          
          state.selectedProduct.numReviews = state.selectedProduct.reviews.length;
          
          if (state.selectedProduct.numReviews > 0) {
            const totalRating = state.selectedProduct.reviews.reduce((acc, r) => acc + r.rating, 0);
            state.selectedProduct.averageRating = totalRating / state.selectedProduct.numReviews;
          } else {
            state.selectedProduct.averageRating = 0;
          }
        }
      });
  },
});

export const { clearSelectedProduct, clearSearchResults } = productSlice.actions;
export default productSlice.reducer;