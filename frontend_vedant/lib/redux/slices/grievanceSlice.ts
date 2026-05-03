import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import apiClient from '@/lib/api/auth'; // Adjust the import path to your authenticated API client

// --- 1. Define TypeScript Interfaces ---

// Represents a single grievance object, matching the Mongoose model
export interface Grievance {
  _id: string;
  userId: string; // Could be expanded to a User object if the API populates it
  ticketId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  orderId?: string;
  natureOfGrievance: "Order Issue" | "Product Issue" | "Delivery Issue" | "Payment Issue" | "Website/App Issue" | "Feedback" | "Other";
  description: string;
  status: "Pending" | "In Progress" | "Resolved" | "Closed" | "Rejected";
  adminResponse?: string | null;
  createdAt: string; // ISO date string
  updatedAt: string;
}

// Payload for creating a new grievance (matches the form fields)
export interface NewGrievancePayload {
  fullName: string;
  email: string;
  phoneNumber?: string;
  orderId?: string;
  natureOfGrievance: Grievance['natureOfGrievance'];
  description: string;
}

// Payload for updating a grievance (Admin action)
export interface UpdateGrievancePayload {
  id: string;
  status?: Grievance['status'];
  adminResponse?: string;
}

// The shape of the state for this slice
interface GrievanceState {
  grievances: Grievance[]; // List of grievances (can be user's or all)
  selectedGrievance: Grievance | null; // For viewing a single grievance detail
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// --- 2. Define the Initial State ---

const initialState: GrievanceState = {
  grievances: [],
  selectedGrievance: null,
  status: 'idle',
  error: null,
};

// --- 3. Create Async Thunks for API Operations ---

// USER: Create a new grievance
export const createGrievance = createAsyncThunk<Grievance, NewGrievancePayload, { rejectValue: string }>(
  'grievance/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/grievances', payload);
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to submit grievance');
    }
  }
);

// USER: Fetch the current user's grievances
export const fetchMyGrievances = createAsyncThunk<Grievance[], void, { rejectValue: string }>(
  'grievance/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/grievances/my');
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch your grievances');
    }
  }
);

// ADMIN: Fetch all grievances from all users
export const fetchAllGrievances = createAsyncThunk<Grievance[], void, { rejectValue: string }>(
  'grievance/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/grievances');
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch all grievances');
    }
  }
);

// ADMIN: Update a grievance's status or response
export const updateGrievance = createAsyncThunk<Grievance, UpdateGrievancePayload, { rejectValue: string }>(
    'grievance/update',
    async ({ id, ...updateData }, { rejectWithValue }) => {
        try {
            const response = await apiClient.put(`/grievances/${id}`, updateData);
            return response.data.data;
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            return rejectWithValue(err.response?.data?.message || 'Failed to update grievance');
        }
    }
);


// --- 4. Create the Slice ---

const grievanceSlice = createSlice({
  name: 'grievance',
  initialState,
  reducers: {
    // Synchronous action to clear the selected grievance, e.g., when a user closes a detail modal
    clearSelectedGrievance: (state) => {
      state.selectedGrievance = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle successful creation
      .addCase(createGrievance.fulfilled, (state, action: PayloadAction<Grievance>) => {
        state.status = 'succeeded';
        // Add the new grievance to the top of the list for immediate feedback
        state.grievances.unshift(action.payload);
      })

      // Handle successful fetching (both user's and admin's)
      .addCase(fetchMyGrievances.fulfilled, (state, action: PayloadAction<Grievance[]>) => {
        state.status = 'succeeded';
        state.grievances = action.payload;
      })
      .addCase(fetchAllGrievances.fulfilled, (state, action: PayloadAction<Grievance[]>) => {
        state.status = 'succeeded';
        state.grievances = action.payload;
      })

      // Handle successful update
      .addCase(updateGrievance.fulfilled, (state, action: PayloadAction<Grievance>) => {
        state.status = 'succeeded';
        const updatedGrievance = action.payload;
        
        // Find and replace the updated grievance in the main list
        const index = state.grievances.findIndex(g => g._id === updatedGrievance._id);
        if (index !== -1) {
          state.grievances[index] = updatedGrievance;
        }

        // Also update it if it's the currently selected one
        if (state.selectedGrievance?._id === updatedGrievance._id) {
            state.selectedGrievance = updatedGrievance;
        }
      })
      
      // Use `addMatcher` for shared logic to reduce duplication
      // Handle pending state for all async thunks
      .addMatcher(
        (action) => action.type.startsWith('grievance/') && action.type.endsWith('/pending'),
        (state) => {
          state.status = 'loading';
          state.error = null;
        }
      )
      // Handle rejected state for all async thunks
      .addMatcher(
        (action) => action.type.startsWith('grievance/') && action.type.endsWith('/rejected'),
        (state, action: PayloadAction<string>) => {
          state.status = 'failed';
          state.error = action.payload;
        }
      );
  },
});

// --- 5. Export Actions and Reducer ---

export const { clearSelectedGrievance } = grievanceSlice.actions;

export default grievanceSlice.reducer;