// lib/api/admin.ts (Corrected Version)

// IMPORTANT: We are now importing the main, correctly configured apiClient from 'auth.ts'
import apiClient from './auth'; 

// Define the types needed for the API responses
export interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt: string;
}

export interface Inquiry {
  _id: string;
  fullName: string; 
  email: string;
  phoneNumber?: string; 
  message: string;
  status: "New" | "Contacted" | "Completed" | "Rejected"; 
  createdAt: string;
  updatedAt: string; 
}

export interface Coupon {
  _id: string;
  code: string;
  discountPercentage: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface TaxConfig {
  _id: string;
  rate: number; // Stored as decimal, e.g., 0.03
}

export interface SimpleCategory {
  _id: string;
  name: string;
  // slug: string;
}

export interface SimpleSubcategory {
  _id: string;
  name: string;
  // slug: string;
}


//coupon wallet 
export interface RewardRule { minSpend: number; pointsAwarded: number; }
export interface WalletConfig { _id: string; rewardRules: RewardRule[]; rupeesPerPoint: number; }


// ==========================================================
// --- PRODUCT API FUNCTIONS ---
// (No changes needed in the functions themselves)
// ==========================================================
export const getAllProductsApi = async (params: { page?: number; limit?: number, type?:string }) => {
  return apiClient.get('/admin/products', { params });
};
export const getProductByIdApi = async (productId: string) => {
  return apiClient.get(`/admin/products/${productId}`);
};
export const createProductApi = async (formData: FormData) => {
  return apiClient.post('/admin/products', formData);
};
export const updateProductApi = async (productId: string, formData: FormData) => {
  return apiClient.put(`/admin/products/${productId}`, formData);
};
export const deleteProductApi = async (productId: string) => {
  return apiClient.delete(`/admin/products/${productId}`);
};

// ==========================================================
// --- USER API FUNCTIONS ---
// ==========================================================
export const getAllUsersApi = async (params: { page?: number; limit?: number; gender?: string; search?: string }) => {
  return apiClient.get('/admin/users', { params });
};
export const getUserByIdApi = async (userId: string) => {
  return apiClient.get(`/admin/users/${userId}`);
};
export const updateUserApi = async (userId: string, updates: Partial<AdminUser>) => {
  return apiClient.put(`/admin/users/${userId}`, updates);
};
export const deleteUserApi = async (userId: string) => {
  return apiClient.delete(`/admin/users/${userId}`);
};

// ==========================================================
// --- INQUIRY (CONTACT) API FUNCTIONS ---
// ==========================================================
export const getAllInquiriesApi = async (status?: string) => {
  const params = status ? { status } : {};
  return apiClient.get('/contact/admin', { params });
};
export const updateInquiryApi = async (inquiryId: string, updates: Partial<Inquiry>) => {
  return apiClient.put(`/contact/admin/${inquiryId}`, updates);
};
export const deleteInquiryApi = async (inquiryId: string) => {
  return apiClient.delete(`/contact/admin/${inquiryId}`);
};

// ==========================================================
// --- COUPON API FUNCTIONS ---
// ==========================================================
export const createCouponApi = (couponData: { code: string; discountPercentage: number; status?: 'active' | 'inactive' }) => {
  return apiClient.post('/coupon', couponData);
};
export const getAllCouponsApi = (status?: 'active' | 'inactive') => {
  const params = status ? { status } : {};
  return apiClient.get('/coupon', { params });
};
export const updateCouponApi = (couponId: string, couponData: Partial<{ code: string; discountPercentage: number; status: 'active' | 'inactive' }>) => {
  return apiClient.patch(`/coupon/${couponId}`, couponData);
};
export const deleteCouponApi = (couponId: string) => {
  return apiClient.delete(`/coupon/${couponId}`);
};
export const getCouponByNameApi = (couponCode: string) => {
  return apiClient.get(`/coupon/code/${couponCode}`);
};

//wallet 
export const getWalletConfigApi = async () => {
  return apiClient.get('/wallet/config');
};
export const setWalletConfigApi = async (configData: { rewardRules: RewardRule[], rupeesPerPoint: number }) => {
  return apiClient.put('/wallet/config', configData);
};

export const getTaxConfigApi = async () => {
  return apiClient.get('/tax/config');
};
export const setTaxConfigApi = async (ratePercentage: number) => {
  return apiClient.put('/tax/config', { ratePercentage });
};

export const getAllCategoriesApi = async () => {
  return apiClient.get('/categories');
};

export const createCategoryApi = async (name: string) => {
  return apiClient.post('/categories', { name });
};

export const updateCategoryApi = async (categoryId: string, name: string) => {
  return apiClient.patch(`/categories/${categoryId}`, { name });
};

export const deleteCategoryApi = async (categoryId: string) => {
  return apiClient.delete(`/categories/${categoryId}`);
};

// subcategory api
export const getAllSubcategoriesApi = async () => {
  return apiClient.get('/subcategories');
};

export const createSubcategoryApi = async (name: string) => {
  return apiClient.post('/subcategories', { name });
};

export const updateSubcategoryApi = async (categoryId: string, name: string) => {
  return apiClient.patch(`/subcategories/${categoryId}`, { name });
};

export const deleteSubcategoryApi = async (categoryId: string) => {
  return apiClient.delete(`/subcategories/${categoryId}`);
};
