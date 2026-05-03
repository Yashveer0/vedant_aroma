import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';


interface ProductStub {
    _id: string;
    name: string;
    price: number;
    images: string[];
}

export interface BulkOrder {
    _id: string;
    product: ProductStub;
    name: string;
    email: string;
    phone: string;
    quantity: number;
    message?: string;
    status: 'Pending' | 'Contacted' | 'Resolved' | 'Cancelled';
    createdAt: string;
    updatedAt: string;
}

export interface NewBulkOrderPayload {
    productId: string;
    name: string;
    email: string;
    phone: string;
    quantity: number;
    message?: string;
}

// The shape of the payload returned by the fetchAll API endpoint
interface FetchBulkOrdersResponse {
    inquiries: BulkOrder[];
    currentPage: number;
    totalPages: number;
    totalInquiries: number;
}

interface BulkOrderState {
    inquiries: BulkOrder[];
    currentPage: number;
    totalPages: number;
    totalInquiries: number;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: BulkOrderState = {
    inquiries: [],
    currentPage: 1,
    totalPages: 1,
    totalInquiries: 0,
    status: 'idle',
    error: null,
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
  : 'http://localhost:8000/api/v1';

// =================================================================
// --- ASYNC THUNKS ---
// =================================================================

export const createBulkOrderInquiry = createAsyncThunk(
    'bulkOrders/create',
    async (inquiryData: NewBulkOrderPayload, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/bulk-orders`, inquiryData);
            return response.data.data as BulkOrder; // Return the created inquiry
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to submit inquiry.');
        }
    }
);

export const fetchAllBulkOrders = createAsyncThunk(
    'bulkOrders/fetchAll',
    async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/bulk-orders?page=${page}&limit=${limit}`);
            // --- THE FIX IS HERE ---
            // Return the entire 'data' object, not just the 'inquiries' array.
            // This ensures the reducer receives the pagination info as well.
            return response.data.data as FetchBulkOrdersResponse;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch inquiries.');
        }
    }
);

export const updateBulkOrder = createAsyncThunk(
    'bulkOrders/updateStatus',
    async ({ inquiryId, status }: { inquiryId: string, status: BulkOrder['status'] }, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`${API_BASE_URL}/bulk-orders/${inquiryId}`, { status });
            return response.data.data as BulkOrder;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status.');
        }
    }
);

export const deleteBulkOrder = createAsyncThunk(
    'bulkOrders/delete',
    async (inquiryId: string, { rejectWithValue }) => {
        try {
            await axios.delete(`${API_BASE_URL}/bulk-orders/${inquiryId}`);
            return inquiryId; // Return the ID for removal from state
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete inquiry.');
        }
    }
);

// =================================================================
// --- SLICE DEFINITION ---
// =================================================================

const bulkOrderSlice = createSlice({
    name: 'bulkOrders',
    initialState,
    reducers: {
        clearBulkOrderError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // --- Fetch All Inquiries ---
            .addCase(fetchAllBulkOrders.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllBulkOrders.fulfilled, (state, action: PayloadAction<FetchBulkOrdersResponse>) => {
                state.status = 'succeeded';
                // Now action.payload is the object { inquiries, currentPage, ... }
                // and this code will work correctly.
                state.inquiries = action.payload.inquiries;
                state.currentPage = action.payload.currentPage;
                state.totalPages = action.payload.totalPages;
                state.totalInquiries = action.payload.totalInquiries;
            })
            .addCase(fetchAllBulkOrders.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // --- Create Inquiry ---
            .addCase(createBulkOrderInquiry.fulfilled, (state, action: PayloadAction<BulkOrder>) => {
                // Prepend the new inquiry to the list for immediate UI feedback on admin panel
                state.inquiries.unshift(action.payload);
                state.totalInquiries += 1;
            })
            .addCase(createBulkOrderInquiry.rejected, (state, action) => {
                // Capture error for user-facing form feedback
                state.error = action.payload as string;
            })

            // --- Update Inquiry ---
            .addCase(updateBulkOrder.fulfilled, (state, action: PayloadAction<BulkOrder>) => {
                const index = state.inquiries.findIndex(inq => inq._id === action.payload._id);
                if (index !== -1) {
                    // Instead of replacing, we merge the objects.
                    // This keeps the existing `product` object (which is populated)
                    // and overwrites any other fields (like `status`) that came
                    // back from the update API call.
                    state.inquiries[index] = {
                        ...state.inquiries[index], // Keep the old data (especially the populated product)
                        ...action.payload,        // Overwrite with the new data from the payload
                    };
                }}
            )


            // --- Delete Inquiry ---
            .addCase(deleteBulkOrder.fulfilled, (state, action: PayloadAction<string>) => {
                state.inquiries = state.inquiries.filter(inq => inq._id !== action.payload);
                state.totalInquiries -= 1;
            });
    },
});

export const { clearBulkOrderError } = bulkOrderSlice.actions;
export default bulkOrderSlice.reducer;