import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";
import type { Currency, PlanName } from "./adminDashboardApi";

export type TxStatus = "pending" | "completed" | "failed" | "refunded";
export type TxProvider = "razorpay" | "lemon_squeezy";
export type TxSort = "newest" | "oldest" | "amountDesc" | "amountAsc";

type Bucket = { total: number; count: number };

/** Money values are INR paise (USD converted at `usdToInr`). */
export interface RevenueStats {
  usdToInr: number;
  totalRevenue: number;
  totalTransactions: number;
  payingCustomers: number;
  mrr: number;
  prevMrr: number;
  mrrGrowth: string | null;
  newSubsThisMonth: number;
  newSubsGrowth: string | null;
  avgOrderValue: number;
  refundedAmount: number;
  successRate: number | null;
  byPlan: Partial<Record<Exclude<PlanName, "free">, Bucket>>;
  byProvider: Partial<Record<TxProvider, Bucket>>;
  byCycle: Partial<Record<"monthly" | "annual", Bucket>>;
  byStatus: Record<TxStatus, number>;
  monthly: { month: string; revenue: number; count: number }[];
}

export interface AdminTransaction {
  _id: string;
  user?: { _id: string; name?: string; email?: string; businessName?: string; picture?: string } | null;
  plan: Exclude<PlanName, "free">;
  amount: number;
  amountInr: number;
  originalAmount: number;
  discountAmount: number;
  couponApplied?: string;
  billingCycle: "monthly" | "annual";
  paymentProvider: TxProvider;
  currency: Currency;
  status: TxStatus;
  transactionId?: string;
  razorpayOrderId?: string;
  failureReason?: string;
  createdAt: string;
}

export interface TransactionFilters {
  search?: string;
  status?: TxStatus | "";
  plan?: Exclude<PlanName, "free"> | "";
  provider?: TxProvider | "";
  from?: string;
  to?: string;
  sort?: TxSort;
}

export interface ListTransactionsResponse {
  transactions: AdminTransaction[];
  filteredRevenue: number;
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export const cleanParams = <T extends object>(params: T) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null));

export const adminRevenueApi = createApi({
  reducerPath: "adminRevenueApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getRevenueStats: builder.query<RevenueStats, void>({
      query: () => "/revenue/stats",
    }),
    listTransactions: builder.query<ListTransactionsResponse, TransactionFilters & { page: number; limit: number }>({
      query: (params) => ({
        url: "/revenue/transactions",
        params: cleanParams(params),
      }),
    }),
    exportTransactions: builder.mutation<Blob, TransactionFilters>({
      query: (params) => ({
        url: "/revenue/transactions/export",
        params: cleanParams(params),
        responseHandler: (response) => response.blob(),
        cache: "no-cache",
      }),
    }),
  }),
});

export const { useGetRevenueStatsQuery, useListTransactionsQuery, useExportTransactionsMutation } = adminRevenueApi;
