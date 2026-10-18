import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import { adminAuthApi } from "./api/adminAuthApi";
import { adminDashboardApi } from "./api/adminDashboardApi";
import { adminUsersApi } from "./api/adminUsersApi";
import { adminRevenueApi } from "./api/adminRevenueApi";
import { adminQRCodesApi } from "./api/adminQRCodesApi";
import { adminPlatformReviewsApi } from "./api/adminPlatformReviewsApi";
import { adminSettingsApi } from "./api/adminSettingsApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [adminAuthApi.reducerPath]: adminAuthApi.reducer,
    [adminDashboardApi.reducerPath]: adminDashboardApi.reducer,
    [adminUsersApi.reducerPath]: adminUsersApi.reducer,
    [adminRevenueApi.reducerPath]: adminRevenueApi.reducer,
    [adminQRCodesApi.reducerPath]: adminQRCodesApi.reducer,
    [adminPlatformReviewsApi.reducerPath]: adminPlatformReviewsApi.reducer,
    [adminSettingsApi.reducerPath]: adminSettingsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      adminAuthApi.middleware,
      adminDashboardApi.middleware,
      adminUsersApi.middleware,
      adminRevenueApi.middleware,
      adminQRCodesApi.middleware,
      adminPlatformReviewsApi.middleware,
      adminSettingsApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
