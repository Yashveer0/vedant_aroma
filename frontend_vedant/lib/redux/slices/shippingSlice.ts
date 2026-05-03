import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '@/lib/api/auth';
import adminClient from '@/lib/api/adminClient';
import { Order } from './orderSlice';

// --- TYPE DEFINITIONS for Shiprocket Tracking Response ---
export interface TrackingScan {
  date: string;
  activity: string;
  location: string;
  "sr-status": string; // And other fields from Shiprocket
}

export interface TrackingData {
  track_status: number;
  shipment_status: number;
  shipment_track: Array<{
    id: number;
    awb_code: string;
    // ... other details
  }>;
  shipment_track_activities: TrackingScan[];
  etd: string;
  error?: string;
  // This is a simplified version, the actual response is larger
}

interface ShippingState {
  trackingData: TrackingData | null;
  loading: boolean;
  isGeneratingAWB: boolean;
  isSchedulingPickup: boolean;
  error: string | null;
}

const initialState: ShippingState = {
  trackingData: null,
  loading: false,
  isGeneratingAWB: false,
  isSchedulingPickup: false,
  error: null,
};


export const generateAWBForOrder = createAsyncThunk<
  Order, // Returns the fully updated Order object on success
  { shipmentId: string },
  { rejectValue: string }
>(
  'shipping/generateAWB',
  async ({ shipmentId }, { rejectWithValue }) => {
    try {
      const response = await adminClient.post('/admin/shipping/generate-awb', { shipmentId });
      return response.data.data; // The backend returns the updated order
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate AWB.');
    }
  }
);

export const schedulePickup = createAsyncThunk<
  any, // The response from Shiprocket isn't critical to store, so `any` is fine
  { shipmentId: string },
  { rejectValue: string }
>(
  'shipping/schedulePickup',
  async ({ shipmentId }, { rejectWithValue }) => {
    try {
      const response = await adminClient.post('/admin/shipping/schedule-pickup', { shipmentId });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to schedule pickup.');
    }
  }
);

// --- ASYNC THUNK to fetch tracking data ---
export const trackOrderById = createAsyncThunk<
  TrackingData,      // Return type on success
  string,            // Argument type (orderId)
  { rejectValue: string }
>(
  'shipping/trackOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/shipping/track/${orderId}`);
      // The actual tracking data is nested in response.data.data
      return response.data.data; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tracking details.');
    }
  }
);

const shippingSlice = createSlice({
  name: 'shipping',
  initialState,
  reducers: {
    // Reducer to clear data when the modal is closed
    clearTrackingData: (state) => {
      state.trackingData = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(trackOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.trackingData = null; // Clear previous data on new request
      })
      .addCase(trackOrderById.fulfilled, (state, action: PayloadAction<TrackingData>) => {
        state.loading = false;
        state.trackingData = action.payload;
      })
      .addCase(trackOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(generateAWBForOrder.pending, (state) => {
        state.isGeneratingAWB = true;
        state.error = null;
      })
      .addCase(generateAWBForOrder.fulfilled, (state) => {
        state.isGeneratingAWB = false;
      })
      .addCase(generateAWBForOrder.rejected, (state, action) => {
        state.isGeneratingAWB = false;
        state.error = action.payload as string;
      })
      .addCase(schedulePickup.pending, (state) => {
        state.isSchedulingPickup = true;
        state.error = null;
      })
      .addCase(schedulePickup.fulfilled, (state) => {
        state.isSchedulingPickup = false;
      })
      .addCase(schedulePickup.rejected, (state, action) => {
        state.isSchedulingPickup = false;
        state.error = action.payload as string;
      });

  },
});

export const { clearTrackingData } = shippingSlice.actions;
export default shippingSlice.reducer;