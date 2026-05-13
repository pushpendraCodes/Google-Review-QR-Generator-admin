import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";

export const adminDashboardApi = createApi({
  reducerPath: "adminDashboardApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getStats: builder.query<any, void>({
      query: () => "/dashboard/stats",
    }),
  }),
});

export const { useGetStatsQuery } = adminDashboardApi;
