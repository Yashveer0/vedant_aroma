// lib/redux/slices/authSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchUserProfile,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultUserAddress,
} from './userSlice';
import { RootState } from '../store';

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

interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  addresses: Address[];
  wishlist: string[];
  wallet?: number; // Points available for redemption
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
}

const loadState = (): AuthState => {
  try {
    const serializedState = typeof window !== 'undefined' ? localStorage.getItem('authState') : null;
    //  ("--serializedState--")
    //  (serializedState)
    if (serializedState === null) {
      return { isAuthenticated: false, user: null, accessToken: null };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return { isAuthenticated: false, user: null, accessToken: null };
  }
};

const saveState = (state: AuthState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('authState', serializedState);
  } catch (err) {
    // Ignore write errors
  }
};

const initialState: AuthState = loadState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      saveState(state);
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authState');
      }
    },

    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        saveState(state);
      }
    },

    addAddress: (state, action: PayloadAction<Address>) => {
      if (state.user) {
        if (state.user.addresses.length === 0) {
          action.payload.isDefault = true;
        }
        state.user.addresses.push(action.payload);
        saveState(state);
      }
    },

    removeAddress: (state, action: PayloadAction<string>) => {
        if (state.user) {
            const addressIdToRemove = action.payload;
            const addressToRemove = state.user.addresses.find(addr => addr._id === addressIdToRemove);
            const wasDefault = addressToRemove?.isDefault;

            state.user.addresses = state.user.addresses.filter(addr => addr._id !== addressIdToRemove);

            if (wasDefault && state.user.addresses.length > 0) {
                if (!state.user.addresses.some(a => a.isDefault)) {
                    state.user.addresses[0].isDefault = true;
                }
            }
            saveState(state);
        }
    },

    updateAddress: (state, action: PayloadAction<Address>) => {
      if (state.user) {
        const index = state.user.addresses.findIndex(addr => addr._id === action.payload._id);
        if (index !== -1) {
          state.user.addresses[index] = action.payload;
          saveState(state);
        }
      }
    },

    setDefaultAddress: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.addresses.forEach(addr => {
          addr.isDefault = addr._id === action.payload;
        });
        saveState(state);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        saveState(state);
      })
      .addCase(addUserAddress.fulfilled, (state, action: PayloadAction<Address[]>) => {
        if (state.user) {
          state.user.addresses = action.payload;
          saveState(state);
        }
      })
      .addCase(updateUserAddress.fulfilled, (state, action: PayloadAction<Address[]>) => {
        if (state.user) {
          state.user.addresses = action.payload;
          saveState(state);
        }
      })
      .addCase(deleteUserAddress.fulfilled, (state, action: PayloadAction<Address[]>) => {
        if (state.user) {
          state.user.addresses = action.payload;
          saveState(state);
        }
      })
      .addCase(setDefaultUserAddress.fulfilled, (state, action: PayloadAction<Address[]>) => {
        if (state.user) {
          state.user.addresses = action.payload;
          saveState(state);
        }
      });
  },
});

export const {
  loginSuccess,
  logout,
  updateUserProfile,
  addAddress,
  removeAddress,
  updateAddress,
  setDefaultAddress,
} = authSlice.actions;

export default authSlice.reducer;

export const selectIsAuthenticated = (state: RootState): boolean => state.auth.isAuthenticated;

export const selectCurrentUser = (state: RootState): User | null => state.auth.user;