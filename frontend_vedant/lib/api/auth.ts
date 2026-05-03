import axios, { AxiosError } from 'axios';
// IMPORTANT: Hum yahan se sirf 'TYPES' import kar rahe hain, store ki actual file nahi.
import type { AppStore, RootState } from '@/lib/redux/store';
import { logout } from '@/lib/redux/slices/authSlice';
import { API_BASE_URL } from '@/lib/api/config';

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

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  addresses: Address[];
  wishlist: string[];
  createdAt: string;
  updatedAt: string;
}

interface AuthResponseData {
  user: User;
  accessToken: string;
}

interface BackendResponse<T> {
  statusCode: number;
  data: T;
  message: string;
}

// =================================================================
// --- AXIOS INSTANCE SETUP ---
// (This remains the same)
// =================================================================

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// =================================================================
// --- INTERCEPTORS SETUP FUNCTION (THE FIX) ---
// Yeh naya function hai jo store ko bahar se lega.
// This new function will take the store from outside.
// =================================================================

export const setupInterceptors = (store: AppStore) => {
  /**
   * Request Interceptor
   * Har request se pehle yeh chalega.
   */
  apiClient.interceptors.request.use(
    (config) => {
      // Store ko parameter se access kar rahe hain.
      // Accessing the store from the parameter.
      const state: RootState = store.getState();
      const accessToken = state.auth.accessToken;

        // ("Request interceptor called for URL:", config.url);
        // ("Access token in interceptor:", !!accessToken);

      if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
          // ("Authorization header set:", config.headers['Authorization']);
      } else {
          ("No access token found, skipping Authorization header");
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  /**
   * Response Interceptor
   * Server se response aane ke baad yeh chalega.
   */
  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response && error.response.status === 401) {
        // console.error("Authentication Error (401): Token expired or invalid. Logging out.");
        
        // Store ko parameter se use karke action dispatch kar rahe hain.
        // Using the store from the parameter to dispatch an action.
        store.dispatch(logout());
      }
      return Promise.reject(error);
    }
  );
};

// =================================================================
// --- API FUNCTIONS ---
// (Aapki saari API functions jaisi thi waisi hi rahengi. No changes needed here)
// =================================================================

export const registerUserApi = async (userData: { name: string; email: string; password: string,phone:string ,role:string }) => {
  try {
    const response = await apiClient.post<BackendResponse<{ email: string }>>(
      '/auth/register', 
      userData
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'An unexpected error occurred during registration.');
  }
};

export const verifyOtpApi = async (otpData: { email: string; otp: string }) => {
  try {
    const response = await apiClient.post<BackendResponse<AuthResponseData>>(
      '/auth/verify-otp', 
      otpData
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to verify OTP.');
  }
};

export const loginUserApi = async (credentials: { email: string; password: string }) => {
  try {
    const response = await apiClient.post<BackendResponse<AuthResponseData>>(
      '/auth/login', 
      credentials
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Invalid credentials or server error.');
  }
};

export const logoutUserApi = async () => {
  try {
    const response = await apiClient.post<BackendResponse<{}>>(
      '/auth/logout'
    );
    return response.data;
  } catch (error: any) {
    console.error("Logout API call failed:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Logout failed on the server.');
  }
};


// Export the configured apiClient
export default apiClient;
