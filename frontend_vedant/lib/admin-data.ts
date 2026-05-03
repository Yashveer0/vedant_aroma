// admin-data.ts
import axios from 'axios';
import { AxiosResponse } from 'axios';
import { Product } from '@/lib/data'; // Your frontend Product type definition

// Set the base URL for your API. Store this in a .env file for production.
const API_BASE_URL =  `${process.env.NEXT_PUBLIC_API_URL}/api/v1` || 'http://localhost:8000/api/v1';

// Create an Axios instance for API calls
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Helper to set the authorization header
const getAuthHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    // 'Content-Type': 'multipart/form-data' is set automatically by browsers for FormData
  },
});

interface GetUsersParams {
  page?: number;
  limit?: number;
  gender?: string;
  search?: string;
}

export interface AdminUser {
  _id: string;      // The unique identifier from MongoDB
  id: string;       // A virtual 'id' property for frontend convenience (if you add it)
  fullName: string;
  email: string;
  avatar?: string;  // Optional field
  role: 'user' | 'admin';
  gender?: 'Male' | 'Female' | 'Other'; // Optional field, assuming it's not always present
  isVerified: boolean;
  
  // Arrays of nested objects or references
  // addresses: Address[];
  wishlist: string[]; // This will be an array of product IDs (strings)
  // cart: CartItem[];
  
  // Timestamps added by Mongoose
  createdAt: string; // Timestamps are typically serialized as ISO date strings
  updatedAt: string;
  
  // Frontend-specific state, not from the backend model
  // (Example: to track if this user's data is currently being fetched)
  status?: 'idle' | 'loading' | 'succeeded' | 'failed'; 
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  image?: string; // Add the optional image URL field
  sentTo: number;
  createdAt: string;
  updatedAt: string;
}


export interface PaginatedNotifications {
  data: Notification[];
  currentPage: number;
  totalPages: number;
  totalNotifications: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  currentPage: number;
  totalPages: number;
  totalNotifications: number;
}

// export const createNotificationApi = async (
//   formData: FormData, // Change the parameter from an object to FormData
//   token: string
// ): Promise<ApiResponse<Notification>> => {
//   const response: AxiosResponse<ApiResponse<Notification>> = await apiClient.post(
//     '/notifications',
//     formData, // Pass FormData directly
//     getAuthHeaders(token)
//   );
//   return response.data;
// };

// export const getAllNotificationsApi = async (
//   { page = 1, limit = 10 }: { page?: number; limit?: number },
//   token: string
// ): Promise<PaginatedNotifications> => {
//   const response: AxiosResponse<ApiResponse<Notification[]> & PaginatedNotifications> = 
//     await apiClient.get(
//       `/notifications?page=${page}&limit=${limit}`,
//       getAuthHeaders(token)
//     );
  
//   // Return in the format expected by the Redux slice
//   return {
//     data: response.data.data,
//     currentPage: response.data.currentPage,
//     totalPages: response.data.totalPages,
//     totalNotifications: response.data.totalNotifications,
//   };
// };

// export const deleteNotificationApi = async (
//   notificationId: string,
//   token: string
// ): Promise<void> => {
//   await apiClient.delete(`/notifications/${notificationId}`, getAuthHeaders(token));
// };


// export interface AdminUser {
//   _id: string; // Typically corresponds to MongoDB's `_id`
//   fullName: string;
//   email: string;
//   // phoneNumber: string;
//   role: string;
//   // gender: 'Male' | 'Female' | 'Other';
//   // status: 'Active' | 'Blocked';
//   // You can add other fields from your User model as needed, like:
//   // createdAt?: string;
//   // role?: string;
// }


// --- API FUNCTIONS ---

export const getProductByIdApi = async (productId: string): Promise<{ data: Product }> => {
  const response = await apiClient.get(`/admin/products/${productId}`, getAuthHeaders(token));
  return response.data; // Expects backend to return { success: true, data: Product }
};

export const getAllProductsApi = async (token: string): Promise<{ data: { products: Product[] } }> => {
  // Assuming your backend route is GET /api/v1/admin/products
  const response = await apiClient.get('/admin/products', getAuthHeaders(token));
  return response.data; // Expects backend to return { success: true, data: { products: [...] } }
};

export const createProductApi = async (formData: FormData): Promise<{ data: Product }> => {
  const response = await apiClient.post('/admin/products', formData, getAuthHeaders(token));
  return response.data; // Expects backend to return { success: true, data: Product }
};

export const updateProductApi = async (productId: string, formData: FormData): Promise<{ data: Product }> => {
  const response = await apiClient.put(`/admin/products/${productId}`, formData, getAuthHeaders(token));
  return response.data; // Expects backend to return { success: true, data: Product }
};

export const deleteProductApi = async (productId: string): Promise<void> => {
  await apiClient.delete(`/admin/products/${productId}`, getAuthHeaders(token));
};
export const getAllUsersApi = (params: GetUsersParams = {}) => {
  // Use URLSearchParams to easily build the query string
  const query = new URLSearchParams();
  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));
  if (params.gender) query.append('gender', params.gender);
  if (params.search) query.append('search', params.search);
  
  return apiClient(`/admin/users?${query.toString()}`, { method: 'GET' });
};

export const getUserByIdApi = (userId: string) => {
  return apiClient(`/admin/users/${userId}`, { method: 'GET' });
};

export const updateUserApi = (userId: string, data: Partial<AdminUser>) => {
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`,
      // 'Content-Type': 'application/json' is set automatically by axios for object data
    }
  };

  return apiClient(`/admin/users/${userId}`, { // This is the generic `axios(url, config)` call
    method: 'PUT',
    data 
                          
  });
};

export const deleteUserApi = (userId: string) => {
  return apiClient(`/admin/users/${userId}`, { method: 'DELETE' });
};

const token = "45678"
export const createCouponApi = (couponData: { code: string; discountPercentage: number; status?: 'active' | 'inactive' }, token: string) => {
  return apiClient('/coupon', {
    method: 'POST',
    headers: {
      // The Authorization header is still needed for your backend
      'Authorization': `Bearer ${token}`,
    },
    // --- FIX: Use 'data' for Axios, not 'body' ---
    // Axios will automatically stringify this object and set the Content-Type header.
    data: couponData,
  });
};



export const getAllCouponsApi = (status?: 'active' | 'inactive') => {
  let endpoint = '/coupon';

  // If a status is provided, append it as a query parameter
  if (status) {
    endpoint += `?status=${status}`;
  }
  
  return apiClient(endpoint, { 
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
  });
};


export const updateCouponApi = (couponId: string, couponData: Partial<{ code: string; discountPercentage: number; status: 'active' | 'inactive' }>) => {
  return apiClient(`/coupon/${couponId}`, {
    method: 'PATCH',
    
    data: couponData,
  });
};

/**
 * Deletes a coupon. (Admin)
 * @param couponId The ID of the coupon to delete.
 */
export const deleteCouponApi = (couponId: string) => {
  return apiClient(`/coupon/${couponId}`, {
    method: 'DELETE',
  });
};

// export const createNotificationApi = async (
//   data: { title: string; message: string },
//   token: string
// ): Promise<{ data: Notification }> => {
//   const response = await apiClient.post('/notifications', data, getAuthHeaders(token));
//   return response.data;
// };

// export const getAllNotificationsApi = async (
//   { page = 1, limit = 10 }: { page?: number; limit?: number },
//   token: string
// ): Promise<PaginatedNotifications> => {
//   const response = await apiClient.get(
//     `/notifications?page=${page}&limit=${limit}`,
//     getAuthHeaders(token)
//   );
//   return response.data;
// };

// export const deleteNotificationApi = async (
//   notificationId: string,
//   token: string
// ): Promise<void> => {
//   await apiClient.delete(`/notifications/${notificationId}`, getAuthHeaders(token));
// };

