import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";

export const adminRevenueApi = createApi({
  reducerPath: "adminRevenueApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getRevenueStats: builder.query<any, void>({
      query: () => "/revenue/stats",
    }),
    listTransactions: builder.query<any, any>({
      query: (params) => ({
        url: "/revenue/transactions",
        params,
      }),
    }),
  }),
});

export const { useGetRevenueStatsQuery, useListTransactionsQuery } = adminRevenueApi;
