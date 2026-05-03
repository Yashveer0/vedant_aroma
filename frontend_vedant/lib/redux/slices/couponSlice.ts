import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'sonner';
import { createCouponApi, deleteCouponApi, getAllCouponsApi, getCouponByNameApi, updateCouponApi } from '@/lib/api/admin';

// --- Type Definitions (No change) ---
export interface Coupon {
    _id: string;
    code: string;
    discountPercentage: number;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

interface CouponState {
    coupons: Coupon[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

// --- Initial State (No change) ---
const initialState: CouponState = {
    coupons: [],
    status: 'idle',
    error: null,
};

// --- Async Thunks (CORRECTED: Removed all getToken and getState logic) ---
export const fetchCoupons = createAsyncThunk(
    'coupons/fetchAll',
    async (status: 'active' | 'inactive' | undefined, { rejectWithValue }) => {
        try {
            // The apiClient from admin.ts will automatically add the token.
            const response = await getAllCouponsApi(status);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch coupons.');
        }
    }
);

export const fetchCouponByName = createAsyncThunk(
    'coupons/fetchByName',
    async (couponCode: string, { rejectWithValue }) => {
        try {
            const response = await getCouponByNameApi(couponCode);
            return response.data.data as Coupon;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'An error occurred.');
        }
    }
);

export const createCoupon = createAsyncThunk(
    'coupons/create',
    async (couponData: { code: string; discountPercentage: number }, { rejectWithValue }) => {
        try {
            // The apiClient from admin.ts will automatically add the token.
            const response = await createCouponApi(couponData);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create coupon.');
        }
    }
);

export const updateCoupon = createAsyncThunk(
    'coupons/update',
    async ({ couponId, couponData }: { couponId: string; couponData: Partial<Coupon> }, { rejectWithValue }) => {
        try {
            // The apiClient from admin.ts will automatically add the token.
            const response = await updateCouponApi(couponId, couponData);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update coupon.');
        }
    }
);

export const deleteCoupon = createAsyncThunk(
    'coupons/delete',
    async (couponId: string, { rejectWithValue }) => {
        try {
            // The apiClient from admin.ts will automatically add the token.
            await deleteCouponApi(couponId);
            return couponId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete coupon.');
        }
    }
);

// --- Slice Definition (No changes needed here, it was already correct) ---
const couponSlice = createSlice({
    name: 'coupons',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchCoupons.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchCoupons.fulfilled, (state, action: PayloadAction<Coupon[]>) => {
                state.status = 'succeeded';
                state.coupons = action.payload;
            })
            .addCase(fetchCoupons.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
                toast.error(state.error); 
            })
            // Create
            .addCase(createCoupon.fulfilled, (state, action: PayloadAction<Coupon>) => {
                state.coupons.unshift(action.payload);
                toast.success('Coupon created successfully!');
            })
            .addCase(createCoupon.rejected, (_, action) => {
                toast.error(action.payload as string);
            })
            // Update
            .addCase(updateCoupon.fulfilled, (state, action: PayloadAction<Coupon>) => {
                const index = state.coupons.findIndex(c => c._id === action.payload._id);
                if (index !== -1) {
                    state.coupons[index] = action.payload;
                }
                toast.success('Coupon updated successfully!');
            })
            .addCase(updateCoupon.rejected, (_, action) => {
                toast.error(action.payload as string);
            })
            // Delete
            .addCase(deleteCoupon.fulfilled, (state, action: PayloadAction<string>) => {
                state.coupons = state.coupons.filter(c => c._id !== action.payload);
                toast.success('Coupon deleted successfully!');
            })
            .addCase(deleteCoupon.rejected, (_, action) => {
                toast.error(action.payload as string);
            });
    },
});

export default couponSlice.reducer;