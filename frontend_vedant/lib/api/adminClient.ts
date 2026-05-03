// @/lib/api/adminClient.ts

import axios from 'axios';
import type { RootState, AppStore } from '@/lib/redux/store'; // Keep type imports, they don't cause cycles

const adminApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1` : 'http://localhost:8000/api/v1',
  withCredentials: true,
});

// Create an exported function to set up the interceptor
// It will receive the store as an argument
export const setupAdminClientInterceptors = (store: AppStore) => {
  adminApiClient.interceptors.request.use(
    (config) => {
      // Get the current Redux state using the passed store
      const state: RootState = store.getState();
      const token = state.auth.accessToken;

      // If a token exists, add it to the Authorization header
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

export default adminApiClient;