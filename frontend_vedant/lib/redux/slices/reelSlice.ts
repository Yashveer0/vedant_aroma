import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import apiClient from '@/lib/api/auth'; // Ensure this path is correct

// --- TypeScript Interfaces ---

export interface Reel {
  _id: string;
  title: string;
  productName: string;
  youtubeLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewReelPayload {
  title: string;
  productName: string;
  youtubeLink?: string;
}

export interface UpdateReelPayload {
  id: string;
  data: Partial<NewReelPayload>;
}

interface ReelState {
  reels: Reel[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// --- Initial State ---

const initialState: ReelState = {
  reels: [],
  status: 'idle',
  error: null,
};

// --- Async Thunks ---

export const fetchAllReels = createAsyncThunk<Reel[], void, { rejectValue: string }>(
  'reels/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/reels');
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch reels');
    }
  }
);

export const createReel = createAsyncThunk<Reel, NewReelPayload, { rejectValue: string }>(
  'reels/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/reels', payload);
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to create reel');
    }
  }
);

export const updateReel = createAsyncThunk<Reel, UpdateReelPayload, { rejectValue: string }>(
  'reels/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/reels/${id}`, data);
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to update reel');
    }
  }
);

export const deleteReel = createAsyncThunk<string, string, { rejectValue: string }>(
  'reels/delete',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/reels/${id}`);
      return id; // Return ID for easy removal from state
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to delete reel');
    }
  }
);

// --- Slice Definition ---

const reelSlice = createSlice({
  name: 'reels',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllReels.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reels = action.payload;
      })
      .addCase(createReel.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reels.unshift(action.payload);
      })
      .addCase(updateReel.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.reels.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.reels[index] = action.payload;
        }
      })
      .addCase(deleteReel.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.reels = state.reels.filter(r => r._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith('reels/') && action.type.endsWith('/pending'),
        (state) => {
          state.status = 'loading';
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('reels/') && action.type.endsWith('/rejected'),
        (state, action: PayloadAction<string>) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  },
});

export default reelSlice.reducer;

