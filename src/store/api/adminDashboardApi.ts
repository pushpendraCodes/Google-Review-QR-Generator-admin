import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";

export type Currency = "INR" | "USD";
export type PlanName = "free" | "starter" | "pro" | "agency";

export interface DashboardSeriesPoint {
  date: string;
  signups: number;
  scans: number;
  /** INR paise, USD converted at `usdToInr` */
  revenue: number;
}

/** All revenue amounts are INR paise (USD converted at `usdToInr`) unless suffixed `UsdOriginal` (cents). */
export interface DashboardStats {
  range: number;
  usdToInr: number;
  users: { total: number; newThisMonth: number; growth: string | null; activeSubscribers: number };
  revenue: {
    total: number;
    totalUsdOriginal: number;
    mrr: number;
    mrrUsdOriginal: number;
    prevMrr: number;
    mrrGrowth: string | null;
    newSubsThisMonth: number;
    avgOrderValue: number;
  };
  qrCodes: {
    total: number;
    active: number;
    totalScans: number;
    scansThisMonth: number;
    scansGrowth: string | null;
  };
  ratings: { average: number; totalReviews: number };
  plans: Record<PlanName, number>;
  series: DashboardSeriesPoint[];
  recentUsers: {
    _id: string;
    name?: string;
    email: string;
    plan: PlanName;
    picture?: string;
    createdAt: string;
  }[];
  recentTransactions: {
    _id: string;
    plan: PlanName;
    amount: number;
    amountInr: number;
    currency: Currency;
    billingCycle: "monthly" | "annual";
    createdAt: string;
    user?: { name?: string; email?: string } | null;
  }[];
  topQRs: {
    _id: string;
    businessName: string;
    shortCode: string;
    scanCount: number;
    placeRating?: number;
    totalReviews?: number;
    owner?: { email?: string; plan?: PlanName } | null;
  }[];
}

export const adminDashboardApi = createApi({
  reducerPath: "adminDashboardApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getStats: builder.query<DashboardStats, number | void>({
      query: (range = 30) => `/dashboard/stats?range=${range}`,
    }),
  }),
});

export const { useGetStatsQuery } = adminDashboardApi;
