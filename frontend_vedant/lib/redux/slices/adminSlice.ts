import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'sonner';

import {
  getAllProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  getProductByIdApi,
  getAllUsersApi,
  getUserByIdApi,
  updateUserApi,
  deleteUserApi,
  getWalletConfigApi,
  setWalletConfigApi,
  type WalletConfig,
  type RewardRule,
  getTaxConfigApi,
  setTaxConfigApi,
  type TaxConfig,
  SimpleCategory ,
  getAllCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,

    // subcategory
    SimpleSubcategory,
    getAllSubcategoriesApi,
    createSubcategoryApi,
    updateSubcategoryApi,
    deleteSubcategoryApi
  
} from '@/lib/api/admin';

import type { Product } from '@/lib/types/product';
import type { Product as Service } from '@/lib/types/product';
import type { AdminUser } from '@/lib/api/admin'; 

interface AdminState {
  products: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  selectedProduct: Product | null;
  selectedProductStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  productPagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
  };

  // --- NEW: Add state for services ---
  services: Service[];
  serviceStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  selectedService: Service | null;
  selectedServiceStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  servicePagination: {
    currentPage: number;
    totalPages: number;
    totalServices: number;
  };


  users: AdminUser[];
  userStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  userPagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
  };
  selectedUser: AdminUser | null;
  selectedUserStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  walletConfig: WalletConfig | null;
  walletConfigStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  walletConfigError: string | null;
  taxConfig: TaxConfig | null;
  taxConfigStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  categories: SimpleCategory[];
  categoryStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  subcategories: SimpleSubcategory[];
  subcategoryStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: AdminState = {
  products: [],
  status: 'idle',
  error: null,
  selectedProduct: null,
  selectedProductStatus: 'idle',
  productPagination: { currentPage: 1, totalPages: 1, totalProducts: 0 },

  services: [],
  serviceStatus: 'idle',
  selectedService: null,
  selectedServiceStatus: 'idle',
  servicePagination: { currentPage: 1, totalPages: 1, totalServices: 0 },

  users: [],
  userStatus: 'idle',
  userPagination: { currentPage: 1, totalPages: 1, totalUsers: 0 },
  selectedUser: null,
  selectedUserStatus: 'idle',
  walletConfig: null,
  walletConfigStatus: 'idle',
  walletConfigError: null,
  taxConfig: null,
  taxConfigStatus: 'idle',
  categories: [],
  categoryStatus: 'idle',
  subcategories: [],
  subcategoryStatus: 'idle',
};


export const fetchProducts = createAsyncThunk(
  'admin/fetchProducts',
  async (params: { page?: number; limit?: number, type:string }, { rejectWithValue }) => {
    try {
      const response = await getAllProductsApi({...params, type: 'product' });
      return response.data.data; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchProductById = createAsyncThunk('admin/fetchProductById', async (productId: string, { rejectWithValue }) => {
  try {
    const response = await getProductByIdApi(productId);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});
 
export const createProduct = createAsyncThunk('admin/createProduct', async (formData: FormData, { rejectWithValue }) => {
  try {
    const response = await createProductApi(formData);
    return response.data.data;
  } catch (error: any) {
     (error)
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updateProduct = createAsyncThunk('admin/updateProduct', async ({ productId, formData }: { productId: string; formData: FormData }, { rejectWithValue }) => {
  try {
    const response = await updateProductApi(productId, formData);
    return response.data.data;
  } catch (error: any) {
     (error)
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const deleteProduct = createAsyncThunk('admin/deleteProduct', async (productId: string, { rejectWithValue }) => {
  try {
    await deleteProductApi(productId);
    return productId;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});


// for services
// --- NEW: fetchServices thunk to fetch 'service' type ---
export const fetchServices = createAsyncThunk(
  'admin/fetchServices',
  async (params: { page?: number; limit?: number, type?: string;  }, { rejectWithValue }) => {
    try {
      // Pass the type explicitly to the API call
      const response = await getAllProductsApi({ ...params, type: 'service' });
      return response.data.data; // The API will return the same structure
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchServiceById = createAsyncThunk('admin/fetchServiceById', async (serviceId: string, { rejectWithValue }) => {
  try {
    // We can reuse the getProductByIdApi as it just fetches by ID
    const response = await getProductByIdApi(serviceId);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params: { page?: number; limit?: number; name?: string }, { rejectWithValue }) => {
    try {
      const response = await getAllUsersApi(params);
      return response.data.data; 
    } catch (error: any) { 
      return rejectWithValue(error.response?.data?.message || error.message); 
    }
  }
);

export const fetchUserById = createAsyncThunk('admin/fetchUserById', async (userId: string, { rejectWithValue }) => {
  try { 
    const response = await getUserByIdApi(userId);
    return response.data.data;
  } catch (e: any) { 
    return rejectWithValue(e.response?.data?.message || e.message); 
  }
});

export const updateUser = createAsyncThunk('admin/updateUser', async ({ userId, updates }: { userId: string; updates: Partial<AdminUser> }, { rejectWithValue }) => {
  try { 
    const response = await updateUserApi(userId, updates);
    return response.data.data;
  } catch (e: any) { 
    return rejectWithValue(e.response?.data?.message || e.message); 
  }
});

export const deleteUser = createAsyncThunk('admin/deleteUser', async (userId: string, { rejectWithValue }) => {
  try { 
    await deleteUserApi(userId); 
    return userId; 
  } catch (e: any) { 
    return rejectWithValue(e.response?.data?.message || e.message); 
  }
});

//walletconfig
export const fetchWalletConfig = createAsyncThunk(
  'admin/fetchWalletConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getWalletConfigApi();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wallet config');
    }
  }
);

// export const updatePointValue = createAsyncThunk(
//   'admin/updatePointValue',
//   async (rupeesPerPoint: number, { rejectWithValue }) => {
//     try {
//       const response = await updatePointValueApi(rupeesPerPoint);
//       toast.success("Point value updated!");
//       return response.data.data;
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Failed to update point value');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// export const addRewardRule = createAsyncThunk(
//   'admin/addRewardRule',
//   async (rule: RewardRule, { rejectWithValue }) => {
//     try {
//       const response = await addRewardRuleApi(rule);
//       toast.success("Reward rule added!");
//       return response.data.data;
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Failed to add rule');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

export const updateWalletConfig = createAsyncThunk(
  'admin/updateWalletConfig',
  async (configData: { rewardRules: RewardRule[], rupeesPerPoint: number }, { rejectWithValue }) => {
    try {
      const response = await setWalletConfigApi(configData);
      toast.success("Wallet settings saved successfully!");
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// export const deleteRewardRule = createAsyncThunk(
//   'admin/deleteRewardRule',
//   async (minSpend: number, { rejectWithValue }) => {
//     try {
//       const response = await deleteRewardRuleApi(minSpend);
//       toast.success("Reward rule deleted!");
//       return response.data.data; // Return the updated config
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Failed to delete rule');
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

export const fetchTaxConfig = createAsyncThunk(
  'admin/fetchTaxConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getTaxConfigApi();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tax configuration');
    }
  }
);

export const updateTaxConfig = createAsyncThunk(
  'admin/updateTaxConfig',
  async (ratePercentage: number, { rejectWithValue }) => {
    try {
      const response = await setTaxConfigApi(ratePercentage);
      toast.success("Tax rate updated successfully!");
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update tax rate');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'admin/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllCategoriesApi();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const addCategory = createAsyncThunk(
  'admin/addCategory',
  async (name: string, { rejectWithValue }) => {
    try {
      const response = await createCategoryApi(name);
      toast.success("Category added successfully!");
      return response.data.data;
    } catch (error: any)      {
      toast.error(error.response?.data?.message || 'Failed to add category');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const editCategory = createAsyncThunk(
  'admin/editCategory',
  async ({ id, name }: { id: string; name: string }, { rejectWithValue }) => {
    try {
      const response = await updateCategoryApi(id, name);
      toast.success("Category updated successfully!");
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update category');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const removeCategory = createAsyncThunk(
  'admin/removeCategory',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteCategoryApi(id);
      toast.success("Category deleted successfully!");
      return id; // Return the ID for removal from state
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);


//subcategory
export const fetchSubcategories = createAsyncThunk(
  'admin/fetchSubcategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllSubcategoriesApi();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subcategories');
    }
  }
);

export const addSubcategory = createAsyncThunk(
  'admin/addSubcategory',
  async (name: string, { rejectWithValue }) => {
    try {
      const response = await createSubcategoryApi(name);
      toast.success("Subcategory added successfully!");
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add subcategory');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const editSubcategory = createAsyncThunk(
  'admin/editSubcategory',
  async ({ id, name }: { id: string; name: string }, { rejectWithValue }) => {
    try {
      const response = await updateSubcategoryApi(id, name);
      toast.success("Subcategory updated successfully!");
      return response.data.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update subcategory');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const removeSubcategory = createAsyncThunk(
  'admin/removeSubcategory',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteSubcategoryApi(id);
      toast.success("Subcategory deleted successfully!");
      return id; // Return the ID for removal from state
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete subcategory');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Product Reducers
      .addCase(fetchProducts.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = 'succeeded';
        state.products = action.payload.products || [];
        state.productPagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalProducts: action.payload.totalProducts,
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      .addCase(fetchProductById.pending, (state) => { state.selectedProductStatus = 'loading'; state.selectedProduct = null; })
      .addCase(fetchProductById.fulfilled, (state, action: PayloadAction<Product>) => {
        state.selectedProductStatus = 'succeeded';
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => { 
          state.selectedProductStatus = 'failed'; 
          toast.error(`Fetch Details Error: ${action.payload as string}`); 
      })



      .addCase(fetchServices.pending, (state) => { 
        state.serviceStatus = 'loading'; 
      })
      .addCase(fetchServices.fulfilled, (state, action: PayloadAction<any>) => {
        state.serviceStatus = 'succeeded';
        state.services = action.payload.products || []; // API returns a 'products' key, we map it to 'services'
        state.servicePagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalServices: action.payload.totalProducts, // API returns 'totalProducts' key
        };
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.serviceStatus = 'failed';
        state.error = action.payload as string; // You can use the same error state or a new one
      })

      .addCase(fetchServiceById.pending, (state) => { 
        state.selectedServiceStatus = 'loading'; 
        state.selectedService = null; 
      })
      .addCase(fetchServiceById.fulfilled, (state, action: PayloadAction<Service>) => {
        state.selectedServiceStatus = 'succeeded';
        state.selectedService = action.payload;
      })
      .addCase(fetchServiceById.rejected, (state, action) => { 
          state.selectedServiceStatus = 'failed'; 
          toast.error(`Fetch Details Error: ${action.payload as string}`); 
      })
      
      // User Reducers
      .addCase(fetchUsers.pending, (state) => { state.userStatus = 'loading'; })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<any>) => {
        state.userStatus = 'succeeded';
        state.users = action.payload.users || [];
        state.userPagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalUsers: action.payload.totalUsers,
        };
      })
      .addCase(fetchUsers.rejected, (state, action) => { 
          state.userStatus = 'failed'; 
          state.error = action.payload as string; 
      })

      .addCase(fetchUserById.pending, (state) => { state.selectedUserStatus = 'loading'; state.selectedUser = null; })
      .addCase(fetchUserById.fulfilled, (state, action: PayloadAction<AdminUser>) => {
        state.selectedUserStatus = 'succeeded'; 
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => { 
          state.selectedUserStatus = 'failed'; 
          toast.error(`Fetch User Details Error: ${action.payload as string}`); 
      })
      
      // Toast Notifications and State Logic Combined
      
      .addCase(createProduct.pending, () => { 
        toast.loading("Creating product...", { id: 'product-action-toast' }); 
      })
      .addCase(createProduct.fulfilled, () => { 
        toast.success("Product created successfully!", { id: 'product-action-toast' }); 
      })
      .addCase(createProduct.rejected, (state, action) => { 
        toast.error(`Create failed: ${action.payload as string}`, { id: 'product-action-toast' }); 
      })

      .addCase(updateProduct.pending, () => { 
        toast.loading("Updating product...", { id: 'product-action-toast' }); 
      })
      .addCase(updateProduct.rejected, (state, action) => { 
        toast.error(`Update failed: ${action.payload as string}`, { id: 'product-action-toast' }); 
      })

      .addCase(updateProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        const updatedItem = action.payload;
        // Check the type of the updated item and update the correct state array
        if (updatedItem.type === 'product') {
            const index = state.products.findIndex(p => p._id === updatedItem._id);
            if (index !== -1) {
              state.products[index] = updatedItem;
            }
        } else if (updatedItem.type === 'service') {
            const index = state.services.findIndex(s => s._id === updatedItem._id);
            if (index !== -1) {
              state.services[index] = updatedItem;
            }
        }
      })


      .addCase(deleteProduct.pending, () => {
        toast.loading("Deleting product...", { id: 'product-delete-toast' });
      })
      .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<string>) => {
        state.products = state.products.filter(p => p._id !== action.payload);
        toast.success("Product deleted successfully!", { id: 'product-delete-toast' });
      })
      .addCase(deleteProduct.rejected, (state, action) => { 
        toast.error(`Delete failed: ${action.payload as string}`, { id: 'product-delete-toast' });
      })

      .addCase(updateUser.pending, () => { 
        toast.loading("Updating user...", { id: 'user-action-toast' }); 
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<AdminUser>) => {
        const index = state.users.findIndex(u => u._id === action.payload._id);
        if (index !== -1) state.users[index] = action.payload;
        toast.success("User updated successfully!", { id: 'user-action-toast' });
      })
      .addCase(updateUser.rejected, (state, action) => { 
        toast.error(`Update failed: ${action.payload as string}`, { id: 'user-action-toast' }); 
      })
      
      .addCase(deleteUser.pending, () => {
        toast.loading("Deleting user...", { id: 'user-delete-toast' });
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.users = state.users.filter(u => u._id !== action.payload);
        toast.success("User deleted successfully!", { id: 'user-delete-toast' });
      })
      .addCase(deleteUser.rejected, (state, action) => { 
        toast.error(`Delete failed: ${action.payload as string}`, { id: 'user-delete-toast' });
      })
      .addCase(fetchWalletConfig.pending, (state) => {
        state.walletConfigStatus = 'loading';
      })
      .addCase(fetchWalletConfig.fulfilled, (state, action: PayloadAction<WalletConfig>) => {
        state.walletConfigStatus = 'succeeded';
        state.walletConfig = action.payload;
      })
      .addCase(fetchWalletConfig.rejected, (state, action) => {
        state.walletConfigStatus = 'failed';
        state.walletConfigError = action.payload as string;
      })

      // Reducers for updating the state after a successful action
      // .addCase(updatePointValue.fulfilled, (state, action: PayloadAction<WalletConfig>) => {
      //   state.walletConfig = action.payload;
      // })
      // .addCase(addRewardRule.fulfilled, (state, action: PayloadAction<WalletConfig>) => {
      //   state.walletConfig = action.payload;
      // })
      .addCase(updateWalletConfig.fulfilled, (state, action: PayloadAction<WalletConfig>) => {
        state.walletConfigStatus = 'succeeded';
        state.walletConfig = action.payload;
      })
      .addCase(fetchTaxConfig.pending, (state) => { state.taxConfigStatus = 'loading'; })
      .addCase(fetchTaxConfig.fulfilled, (state, action: PayloadAction<TaxConfig>) => {
        state.taxConfigStatus = 'succeeded';
        state.taxConfig = action.payload;
      })
      .addCase(fetchTaxConfig.rejected, (state) => { state.taxConfigStatus = 'failed'; })
      
      .addCase(updateTaxConfig.fulfilled, (state, action: PayloadAction<TaxConfig>) => {
        state.taxConfig = action.payload;
      })
      .addCase(fetchCategories.pending, (state) => {
        state.categoryStatus = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<SimpleCategory[]>) => {
        state.categoryStatus = 'succeeded';
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.categoryStatus = 'failed';
      })
      .addCase(addCategory.fulfilled, (state, action: PayloadAction<SimpleCategory>) => {
        state.categories.push(action.payload);
      })
      .addCase(editCategory.fulfilled, (state, action: PayloadAction<SimpleCategory>) => {
        const index = state.categories.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(removeCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.categories = state.categories.filter(c => c._id !== action.payload);
      })
      // subcategories ------
      .addCase(fetchSubcategories.pending, (state) => {
        state.subcategoryStatus = 'loading';
      })
      .addCase(fetchSubcategories.fulfilled, (state, action: PayloadAction<SimpleSubcategory[]>) => {
        state.subcategoryStatus = 'succeeded';
        state.subcategories = action.payload;
      })
      .addCase(fetchSubcategories.rejected, (state) => {
        state.subcategoryStatus = 'failed';
      })
      .addCase(addSubcategory.fulfilled, (state, action: PayloadAction<SimpleSubcategory>) => {
        state.subcategories.push(action.payload);
      })
      .addCase(editSubcategory.fulfilled, (state, action: PayloadAction<SimpleSubcategory>) => {
        const index = state.subcategories.findIndex(sc => sc._id === action.payload._id);
        if (index !== -1) {
          state.subcategories[index] = action.payload;
        }
      })
      .addCase(removeSubcategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.subcategories = state.subcategories.filter(sc => sc._id !== action.payload);
      });
      
  },
});

export default adminSlice.reducer;