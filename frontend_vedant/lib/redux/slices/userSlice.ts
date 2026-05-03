import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '@/lib/api/auth'; // The configured Axios instance with auth

// Define types for your state
export interface Address {
  _id: string;
  fullName: string;
  phone: string;
  type: 'Home' | 'Work';
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface NewAddressPayload {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  type: 'Home' | 'Work';
}

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  wallet?: number; // Points available for redemption
}

interface UserState {
  user: User | null;
  addresses: Address[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Define the initial state
const initialState: UserState = {
  user: null,
  addresses: [],
  status: 'idle',
  error: null,
};

// --- ASYNC THUNKS FOR API CALLS ---

// Fetches the entire user profile, including addresses
export const fetchUserProfile = createAsyncThunk('user/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get('/users/profile');
    //    (response.data.data)
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
  }
});

// Updates the user's full name
export const updateUserProfile = createAsyncThunk('user/updateProfile', async (profileData: { fullName?: string, phone?: string }, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch('users/profile', profileData);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
  }
});

//set default user address
export const setDefaultUserAddress = createAsyncThunk(
  'user/setDefaultAddress',
  async (addressId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`/address/default/${addressId}`);
      // The API returns the full, updated list of addresses
      return response.data.data; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set default address');
    }
  }
);

// Updates the user's avatar
export const updateUserAvatar = createAsyncThunk('user/updateAvatar', async (avatarFile: File, { rejectWithValue }) => {
  const formData = new FormData();
  formData.append('avatar', avatarFile);
  try {
    const response = await apiClient.patch('users/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update avatar');
  }
});

// Adds a new address
export const addUserAddress = createAsyncThunk(
  'user/addAddress',
  async (addressData: NewAddressPayload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('users/address', addressData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add address');
    }
  }
);

// Updates an existing address
export const updateUserAddress = createAsyncThunk('user/updateAddress', async ({ addressId, addressData }: { addressId: string, addressData: Partial<Address> }, { rejectWithValue }) => {
    try {
        const response = await apiClient.patch(`users/address/${addressId}`, addressData);
        return response.data.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update address');
    }
});

// Deletes an address
export const deleteUserAddress = createAsyncThunk('user/deleteAddress', async (addressId: string, { rejectWithValue }) => {
    try {
        const response = await apiClient.delete(`users/address/${addressId}`);
        return response.data.data; // The API should return the updated list of addresses
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete address');
    }
});


// --- USER SLICE DEFINITION ---

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Reducer to clear user data on logout
    logoutUser: (state) => {
      state.user = null;
      state.addresses = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.addresses = action.payload.addresses || [];
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Update User Profile
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = { ...state.user, ...action.payload };
      })

      // Update User Avatar
      .addCase(updateUserAvatar.fulfilled, (state, action: PayloadAction<User>) => {
        if (state.user) {
          state.user.avatar = action.payload.avatar;
        }
      })
      
      // Add, Update, and Delete Address
      .addCase(addUserAddress.fulfilled, (state, action: PayloadAction<Address[]>) => {
        state.addresses = action.payload;
      })
      .addCase(updateUserAddress.fulfilled, (state, action: PayloadAction<Address[]>) => {
        state.addresses = action.payload;
      })
      .addCase(deleteUserAddress.fulfilled, (state, action: PayloadAction<Address[]>) => {
        state.addresses = action.payload;
      })
  },
});

export const { logoutUser } = userSlice.actions;

export default userSlice.reducer;