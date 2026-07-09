import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
}

export interface AuthState {
  admin: AdminUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const getStoredAdmin = (): AdminUser | null => {
  try {
    const admin = sessionStorage.getItem("admin");
    return admin ? JSON.parse(admin) : null;
  } catch {
    return null;
  }
};

const getStoredToken = (): string | null => {
  return sessionStorage.getItem("admin_accessToken");
};

const initialState: AuthState = {
  admin: getStoredAdmin(),
  accessToken: getStoredToken(),
  isAuthenticated: !!getStoredToken(),
  isLoading: false,
};

const authSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ admin: AdminUser; accessToken: string }>
    ) => {
      state.admin = action.payload.admin;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      sessionStorage.setItem("admin", JSON.stringify(action.payload.admin));
      sessionStorage.setItem("admin_accessToken", action.payload.accessToken);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    logoutUser: (state) => {
      state.admin = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      sessionStorage.removeItem("admin");
      sessionStorage.removeItem("admin_accessToken");
    },
    updateAdmin: (state, action: PayloadAction<Partial<AdminUser>>) => {
      if (state.admin) {
        state.admin = { ...state.admin, ...action.payload };
        sessionStorage.setItem("admin", JSON.stringify(state.admin));
      }
    },
  },
});

export const { setCredentials, setLoading, logoutUser, updateAdmin } = authSlice.actions;
export default authSlice.reducer;
