// import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// // import {
// //   createNotificationApi,
// //   getAllNotificationsApi,
// //   deleteNotificationApi,
// //   PaginatedNotifications,
// //   Notification,
// // } from '../../admin-data';

// // Define the shape of your slice's state
// interface NotificationState {
//   notifications: Notification[];
//   currentPage: number;
//   totalPages: number;
//   totalNotifications: number;
//   loading: boolean;
//   error: string | null;
//   createLoading: boolean;
//   deleteLoading: string | null;
// }

// // Define the initial state
// const initialState: NotificationState = {
//   notifications: [],
//   currentPage: 1,
//   totalPages: 1,
//   totalNotifications: 0,
//   loading: false,
//   error: null,
//   createLoading: false,
//   deleteLoading: null,
// };

// // --- Async Thunks ---

// // MODIFIED: This thunk now accepts FormData
// export const createNotification = createAsyncThunk<
//   Notification,
//   { formData: FormData; token: string }, // <-- Changed to accept FormData
//   { rejectValue: { message: string } }
// >('notifications/create', async ({ formData, token }, { rejectWithValue }) => {
//   try {
//     // The API function now expects FormData
//     const response = await createNotificationApi(formData, token);
//     return response.data;
//   } catch (error: any) {
//     const errorMessage = error.response?.data?.message || error.message || 'Failed to create notification';
//     return rejectWithValue({ message: errorMessage });
//   }
// });

// export const getAllNotifications = createAsyncThunk<
//   PaginatedNotifications,
//   { page?: number; limit?: number; token: string },
//   { rejectValue: { message: string } }
// >('notifications/getAll', async ({ page = 1, limit = 10, token }, { rejectWithValue }) => {
//   try {
//     const response = await getAllNotificationsApi({ page, limit }, token);
//     return response;
//   } catch (error: any) {
//     const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch notifications';
//     return rejectWithValue({ message: errorMessage });
//   }
// });

// export const deleteNotification = createAsyncThunk<
//   string, // The fulfilled action will return the notificationId
//   { notificationId: string; token: string },
//   { rejectValue: { message: string } }
// >('notifications/delete', async ({ notificationId, token }, { rejectWithValue }) => {
//   try {
//     await deleteNotificationApi(notificationId, token);
//     return notificationId;
//   } catch (error: any) {
//     const errorMessage = error.response?.data?.message || error.message || 'Failed to delete notification';
//     return rejectWithValue({ message: errorMessage });
//   }
// });


// // --- The Slice ---
// const notificationSlice = createSlice({
//   name: 'notifications',
//   initialState,
//   reducers: {
//     clearError: (state) => {
//       state.error = null;
//     },
//     resetPagination: (state) => {
//       state.currentPage = 1;
//       state.totalPages = 1;
//       state.totalNotifications = 0;
//       state.notifications = [];
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Create Notification
//       .addCase(createNotification.pending, (state) => {
//         state.createLoading = true;
//         state.error = null;
//       })
//       .addCase(createNotification.fulfilled, (state, action: PayloadAction<Notification>) => {
//         state.createLoading = false;
//         state.notifications.unshift(action.payload);
//         state.totalNotifications += 1;
        
//         const pageSize = 10;
//         if (state.notifications.length > pageSize && state.currentPage === 1) {
//           state.notifications.pop();
//         }
//       })
//       .addCase(createNotification.rejected, (state, action) => {
//         state.createLoading = false;
//         state.error = action.payload?.message || 'Failed to create notification';
//       })
      
//       // Get All Notifications
//       .addCase(getAllNotifications.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(getAllNotifications.fulfilled, (state, action: PayloadAction<PaginatedNotifications>) => {
//         state.loading = false;
//         state.notifications = action.payload.data;
//         state.currentPage = action.payload.currentPage;
//         state.totalPages = action.payload.totalPages;
//         state.totalNotifications = action.payload.totalNotifications;
//       })
//       .addCase(getAllNotifications.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload?.message || 'Failed to fetch notifications';
//       })
      
//       // Delete Notification
//       .addCase(deleteNotification.pending, (state, action) => {
//         state.deleteLoading = action.meta.arg.notificationId;
//         state.error = null;
//       })
//       .addCase(deleteNotification.fulfilled, (state, action: PayloadAction<string>) => {
//         state.deleteLoading = null;
//         state.notifications = state.notifications.filter(
//           (notification) => notification._id !== action.payload
//         );
//         state.totalNotifications = Math.max(0, state.totalNotifications - 1);
        
//         if (state.notifications.length === 0 && state.currentPage > 1) {
//           state.currentPage = Math.max(1, state.currentPage - 1);
//         }
//       })
//       .addCase(deleteNotification.rejected, (state, action) => {
//         state.deleteLoading = null;
//         state.error = action.payload?.message || 'Failed to delete notification';
//       });
//   },
// });

// export const { clearError, resetPagination } = notificationSlice.actions;
// export default notificationSlice.reducer;