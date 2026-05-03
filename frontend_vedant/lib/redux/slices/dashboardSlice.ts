
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '@/lib/api/adminClient'; // Use your admin client
import type { Order } from './orderSlice'; // Reuse the Order type

interface DashboardStats {
  totalSales: number;
  newOrders: number;
  activeUsers: number;
}

interface SalesDataPoint {
  name: string; // e.g., "Jan", "Feb"
  sales: number;
}

interface DashboardState {
  stats: DashboardStats;
  salesOverview: SalesDataPoint[];
  recentOrders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: {
    totalSales: 0,
    newOrders: 0,
    activeUsers: 0,
  },
  salesOverview: [],
  recentOrders: [],
  loading: true, // Start in loading state
  error: null,
};

// =================================================================
// --- ASYNC THUNKS ---
// =================================================================

// This single thunk will fetch all necessary dashboard data in parallel
export const fetchDashboardData = createAsyncThunk<
  { stats: DashboardStats; salesOverview: SalesDataPoint[]; recentOrders: Order[] },
  void,
  { rejectValue: string }
>(
  'dashboard/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      // Use Promise.all to fetch everything at once for better performance
      const [statsRes, salesRes, ordersRes] = await Promise.all([
        apiClient.get('/admin/dashboard'),      // Your stats endpoint
        apiClient.get('/admin/sales-overview'), // Your sales chart endpoint
        apiClient.get('/admin/orders/recent'),  // Your recent orders endpoint
      ]);
      // console.log("this is data", statsRes.data.data);

      return {
        stats: statsRes.data.data,
        salesOverview: salesRes.data.data,
        recentOrders: ordersRes.data.data,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
);

// =================================================================
// --- DASHBOARD SLICE ---
// =================================================================

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.salesOverview = action.payload.salesOverview;
        state.recentOrders = action.payload.recentOrders;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default dashboardSlice.reducer;