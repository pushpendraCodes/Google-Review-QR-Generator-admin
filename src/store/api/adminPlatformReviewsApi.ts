import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";
import type { PlanName } from "./adminDashboardApi";
import { cleanParams } from "./adminRevenueApi";

export type ReviewStatusFilter = "published" | "hidden" | "featured";
export type ReviewSort = "newest" | "oldest" | "highest" | "lowest";

export interface PlatformReviewStats {
  total: number;
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  byStatus: { published: number; hidden: number };
  featured: number;
  last30: number;
  last30Average: number;
  last30Growth: string | null;
  positivePct: number;
  negativePct: number;
}

export interface PlatformReview {
  _id: string;
  rating: number;
  text: string;
  status: "published" | "hidden";
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    _id: string;
    name?: string;
    email?: string;
    picture?: string;
    businessName?: string;
    businessType?: string;
    businessCity?: string;
    plan?: PlanName;
  } | null;
}

export interface ListPlatformReviewsParams {
  page: number;
  limit: number;
  search?: string;
  rating?: number | "";
  status?: ReviewStatusFilter | "";
  sort?: ReviewSort;
}

export const adminPlatformReviewsApi = createApi({
  reducerPath: "adminPlatformReviewsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["PlatformReview"],
  endpoints: (builder) => ({
    getPlatformReviewStats: builder.query<PlatformReviewStats, void>({
      query: () => "/platform-reviews/stats",
      providesTags: ["PlatformReview"],
    }),
    listPlatformReviews: builder.query<
      { reviews: PlatformReview[]; pagination: { total: number; page: number; limit: number; totalPages: number } },
      ListPlatformReviewsParams
    >({
      query: (params) => ({ url: "/platform-reviews", params: cleanParams(params) }),
      providesTags: ["PlatformReview"],
    }),
    updatePlatformReview: builder.mutation<
      { message: string },
      { id: string; status?: "published" | "hidden"; featured?: boolean }
    >({
      query: ({ id, ...body }) => ({ url: `/platform-reviews/${id}`, method: "PATCH", body }),
      invalidatesTags: ["PlatformReview"],
    }),
    deletePlatformReview: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/platform-reviews/${id}`, method: "DELETE" }),
      invalidatesTags: ["PlatformReview"],
    }),
  }),
});

export const {
  useGetPlatformReviewStatsQuery,
  useListPlatformReviewsQuery,
  useUpdatePlatformReviewMutation,
  useDeletePlatformReviewMutation,
} = adminPlatformReviewsApi;
