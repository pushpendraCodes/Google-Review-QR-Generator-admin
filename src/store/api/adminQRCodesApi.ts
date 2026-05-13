import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";

export const adminQRCodesApi = createApi({
  reducerPath: "adminQRCodesApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getQRStats: builder.query<any, void>({
      query: () => "/qrcodes/stats",
    }),
    listQRCodes: builder.query<any, any>({
      query: (params) => ({
        url: "/qrcodes",
        params,
      }),
    }),
  }),
});

export const { useGetQRStatsQuery, useListQRCodesQuery } = adminQRCodesApi;
