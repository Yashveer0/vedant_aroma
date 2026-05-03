import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import apiClient from '@/lib/api/auth'; // Adjust this path to your authenticated API client

// --- 1. Define TypeScript Interfaces ---

// The shape of a single testimonial object, matching the Mongoose model
export interface Testimonial {
  _id: string;
  name: string;
  productName: string;
  youtubeLink?: string;
  createdAt: string; // ISO date string
  updatedAt: string;
}

// The payload for creating a new testimonial
export interface NewTestimonialPayload {
  name: string;
  productName: string;
  youtubeLink?: string;
}

// The payload for updating a testimonial
export interface UpdateTestimonialPayload {
  id: string; // The ID of the testimonial to update
  data: Partial<NewTestimonialPayload>; // The fields to update
}

// The shape of the state for this slice
interface TestimonialState {
  testimonials: Testimonial[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// --- 2. Define the Initial State ---

const initialState: TestimonialState = {
  testimonials: [],
  status: 'idle',
  error: null,
};

// --- 3. Create Async Thunks for API Operations ---

// FETCH ALL testimonials
export const fetchAllTestimonials = createAsyncThunk<Testimonial[], void, { rejectValue: string }>(
  'testimonials/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/testimonials');
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch testimonials');
    }
  }
);

// CREATE a new testimonial
export const createTestimonial = createAsyncThunk<Testimonial, NewTestimonialPayload, { rejectValue: string }>(
  'testimonials/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/testimonials', payload);
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to create testimonial');
    }
  }
);

// UPDATE an existing testimonial
export const updateTestimonial = createAsyncThunk<Testimonial, UpdateTestimonialPayload, { rejectValue: string }>(
  'testimonials/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/testimonials/${id}`, data);
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to update testimonial');
    }
  }
);

// DELETE a testimonial
export const deleteTestimonial = createAsyncThunk<string, string, { rejectValue: string }>(
  'testimonials/delete',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/testimonials/${id}`);
      return id; // Return the ID of the deleted item for easy removal from state
    } catch (error){
    const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to delete testimonial');
    }
  }
);


// --- 4. Create the Slice ---

const testimonialSlice = createSlice({
  name: 'testimonials',
  initialState,
  reducers: {
    // You could add synchronous reducers here if needed, e.g., to reset state
  },
  extraReducers: (builder) => {
    builder
      // Handle successful fetching of all testimonials
      .addCase(fetchAllTestimonials.fulfilled, (state, action: PayloadAction<Testimonial[]>) => {
        state.status = 'succeeded';
        state.testimonials = action.payload;
      })

      // Handle successful creation of a new testimonial
      .addCase(createTestimonial.fulfilled, (state, action: PayloadAction<Testimonial>) => {
        state.status = 'succeeded';
        // Add the new testimonial to the beginning of the list for immediate UI feedback
        state.testimonials.unshift(action.payload);
      })

      // Handle successful update of a testimonial
      .addCase(updateTestimonial.fulfilled, (state, action: PayloadAction<Testimonial>) => {
        state.status = 'succeeded';
        const updatedTestimonial = action.payload;
        const index = state.testimonials.findIndex(t => t._id === updatedTestimonial._id);
        if (index !== -1) {
          state.testimonials[index] = updatedTestimonial;
        }
      })

      // Handle successful deletion of a testimonial
      .addCase(deleteTestimonial.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        // Filter out the deleted testimonial using the returned ID
        state.testimonials = state.testimonials.filter(t => t._id !== action.payload);
      })

      // Use `addMatcher` to handle pending and rejected states for all thunks
      .addMatcher(
        (action) => action.type.startsWith('testimonials/') && action.type.endsWith('/pending'),
        (state) => {
          state.status = 'loading';
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('testimonials/') && action.type.endsWith('/rejected'),
        (state, action: PayloadAction<string>) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  },
});

// --- 5. Export Actions and Reducer ---

export default testimonialSlice.reducer;