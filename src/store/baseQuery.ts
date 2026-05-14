import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { logoutUser } from "./slices/authSlice";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${BASE_URL}/admin`,
  prepareHeaders: (headers, { getState }) => {
    // Use a local interface or cast as any to break circular dependency with store.ts
    const state = getState() as { auth: { accessToken: string | null } };
    const token = state.auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    console.warn("Unauthorized - logging out");
    api.dispatch(logoutUser());
  }

  return result;
};
