import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/lib/api/auth'; // Use the same authenticated client

// 1. Define the state shape
interface TaxState {
  rate: number; // The tax rate, e.g., 0.03 for 3%
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

// 2. Define the initial state
const initialState: TaxState = {
  rate: 0.03, // A sensible default
  status: 'idle',
};

// 3. Create the async thunk to fetch the config
export const fetchTaxConfig = createAsyncThunk(
  'tax/fetchConfig',
  async (_, { rejectWithValue }) => {
    try {
      // The API endpoint is GET /api/v1/tax/config
      const response = await apiClient.get('/tax/config');
      console.log("---tax ka slice me tax rate----")
      console.log(response)
      return response.data.data.rate; // We only need the rate
    } catch (error: any) {
      return rejectWithValue('Failed to fetch tax rate');
    }
  }
);

// 4. Create the slice
const taxSlice = createSlice({
  name: 'tax',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTaxConfig.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTaxConfig.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.rate = action.payload;
      })
      .addCase(fetchTaxConfig.rejected, (state) => {
        state.status = 'failed';
        // If it fails, we keep the default rate
      });
  },
});

export default taxSlice.reducer;