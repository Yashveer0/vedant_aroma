import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'sonner';
import { getAllInquiriesApi, updateInquiryApi, deleteInquiryApi } from '@/lib/api/admin';
import { API_BASE_URL } from '@/lib/api/config';

// Interface definitions remain the same...
interface ContactInquiry {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    message: string;
    status: "New" | "Contacted" | "Completed" | "Rejected";
    createdAt: string;
    updatedAt: string;
}

interface ContactState {
    inquiries: ContactInquiry[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: ContactState = {
    inquiries: [],
    status: 'idle',
    error: null,
};


// Updated data type to include captchaToken
interface SubmitInquiryData {
    fullName: string;
    email: string;
    message: string;
    phoneNumber?: string;
    captchaToken: string;
}

export const submitContactForm = createAsyncThunk(
    'contact/submit',
    async (inquiryData: SubmitInquiryData, { rejectWithValue }) => {
        try {
            // The inquiryData now includes the captchaToken, which is sent to the backend
            const response = await axios.post(`${API_BASE_URL}/contact`, inquiryData);
            return response.data.message;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Submission failed due to a server error.');
        }
    }
);

// Other async thunks (fetchInquiries, updateInquiry, deleteInquiry) remain the same...
export const fetchInquiries = createAsyncThunk(
    'contact/fetchAll',
    async (status: string | undefined, { rejectWithValue }) => {
        try {
            const response = await getAllInquiriesApi(status);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch inquiries.');
        }
    }
);


export const updateInquiry = createAsyncThunk(
    'contact/update',
    async ({ inquiryId, updates }: { inquiryId: string; updates: Partial<ContactInquiry> }, { rejectWithValue }) => {
        try {
            const response = await updateInquiryApi(inquiryId, updates);
            return response.data.data; 
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update the inquiry.');
        }
    }
);


export const deleteInquiry = createAsyncThunk(
    'contact/delete',
    async (inquiryId: string, { rejectWithValue }) => {
        try {
            await deleteInquiryApi(inquiryId);
            return inquiryId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete the inquiry.');
        }
    }
);


const contactSlice = createSlice({
    name: 'contact',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // extraReducers logic remains the same...
        builder
            .addCase(submitContactForm.pending, () => {
                toast.loading("Sending your inquiry...", { id: 'contact-toast' });
            })
            .addCase(submitContactForm.fulfilled, (_, action) => {
                toast.success(action.payload, { id: 'contact-toast' });
            })
            .addCase(submitContactForm.rejected, (_, action) => {
                toast.error(`Error: ${action.payload}`, { id: 'contact-toast' });
            })
            .addCase(fetchInquiries.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchInquiries.fulfilled, (state, action: PayloadAction<ContactInquiry[]>) => {
                state.status = 'succeeded';
                state.inquiries = action.payload;
            })
            .addCase(fetchInquiries.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
                toast.error(state.error);
            })
            .addCase(updateInquiry.fulfilled, (state, action: PayloadAction<ContactInquiry>) => {
                const index = state.inquiries.findIndex(inquiry => inquiry._id === action.payload._id);
                if (index !== -1) {
                    state.inquiries[index] = action.payload;
                }
                toast.success("Inquiry updated successfully!");
            })
            .addCase(updateInquiry.rejected, (_, action) => {
                toast.error(`Update failed: ${action.payload as string}`);
            })
            .addCase(deleteInquiry.fulfilled, (state, action: PayloadAction<string>) => {
                state.inquiries = state.inquiries.filter(inquiry => inquiry._id !== action.payload);
                toast.success("Inquiry deleted successfully!");
            })
            .addCase(deleteInquiry.rejected, (_, action) => {
                toast.error(`Delete failed: ${action.payload as string}`);
            });
    },
});

export default contactSlice.reducer;
