import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";
import type { Currency, PlanName } from "./adminDashboardApi";

export type UserStatus = "active" | "block";
export type UserSort = "newest" | "oldest" | "lastLogin" | "name";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  picture?: string;
  authProvider: "google" | "email";
  isEmailVerified: boolean;
  businessName?: string;
  businessType?: string;
  businessCity?: string;
  plan: PlanName;
  planExpiresAt: string | null;
  planActive: boolean;
  status: UserStatus;
  lastLoginAt: string | null;
  emailNotifications?: boolean;
  weeklyReportEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
  /** Agency team seats (detail endpoint only) */
  extraSeats?: number;
  teamMembers?: number;
  seatLimit?: number;
  maxExtraSeats?: number;
}

export interface AdminUserListItem extends AdminUser {
  qrCount: number;
  totalScans: number;
}

export interface ListUsersParams {
  page: number;
  limit: number;
  search?: string;
  plan?: PlanName | "";
  status?: UserStatus | "";
  sort?: UserSort;
}

export interface ListUsersResponse {
  users: AdminUserListItem[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
  stats: {
    total: number;
    blocked: number;
    newThisMonth: number;
    activeLast30: number;
    paidActive: number;
    churned: number;
    churnRate: string;
    byPlan: Record<PlanName, number>;
  };
}

export interface UserQRCode {
  _id: string;
  businessName: string;
  label?: string;
  placeAddress?: string;
  placeRating?: number;
  totalReviews?: number;
  googleSyncedAt?: string | null;
  reviewUrl: string;
  scanCount: number;
  status: "active" | "archived";
  isActive?: boolean;
  shortCode: string;
  qrConfig?: { logoUrl?: string };
  createdAt: string;
}

export interface UserTransaction {
  _id: string;
  plan: PlanName;
  amount: number;
  amountInr: number;
  originalAmount: number;
  discountAmount: number;
  couponApplied?: string;
  currency: Currency;
  billingCycle: "monthly" | "annual";
  kind?: "plan" | "seats";
  seats?: number;
  paymentProvider: "razorpay" | "lemon_squeezy";
  status: "pending" | "completed" | "failed" | "refunded";
  createdAt: string;
}

export interface TeamMember {
  _id: string;
  name: string;
  email: string;
  picture?: string;
  status: UserStatus;
  lastLoginAt: string | null;
  teamJoinedAt: string | null;
  createdAt: string;
  qrCount: number;
  clientCount: number;
}

export interface TeamInviteItem {
  _id: string;
  email: string;
  expiresAt: string;
  lastSentAt: string;
  createdAt: string;
  expired: boolean;
}

export interface AgencyClientItem {
  _id: string;
  name: string;
  email: string;
  status: "active" | "disabled";
  lastLoginAt: string | null;
  billingCurrency: string;
  createdAt: string;
  /** Team member who added the client; null when the agency owner did. */
  createdBy: { _id: string; name: string; email: string } | null;
  qrCount: number;
  qrNames: string[];
  pendingClaims: number;
  billing: { blocked: boolean; blocksOn: string | null; overdueAmount: number };
}

export interface TeamOf {
  owner: {
    _id: string;
    name: string;
    email: string;
    businessName?: string;
    picture?: string;
    plan: PlanName;
    planExpiresAt: string | null;
    planActive: boolean;
  };
  joinedAt: string | null;
  qrCount: number;
  clientCount: number;
}

export interface UserDetailsResponse {
  user: AdminUser;
  qrCodes: UserQRCode[];
  team: { members: TeamMember[]; invites: TeamInviteItem[] };
  clients: AgencyClientItem[];
  /** Set when this user is a staff member of another account. */
  teamOf: TeamOf | null;
  transactions: UserTransaction[];
  scanSeries: { date: string; value: number }[];
  topLocations: { city: string; country: string; count: number }[];
  stats: {
    qrCount: number;
    activeQrCount: number;
    totalScans: number;
    scansLast30: number;
    lastScanAt: string | null;
    lifetimeSpendInr: number;
    paymentsCount: number;
  };
  usdToInr: number;
}

export const adminUsersApi = createApi({
  reducerPath: "adminUsersApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    listUsers: builder.query<ListUsersResponse, ListUsersParams>({
      query: (params) => ({
        url: "/users",
        params: Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== undefined)),
      }),
      providesTags: ["User"],
    }),
    getUser: builder.query<UserDetailsResponse, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: "User", id }],
    }),
    updateUserStatus: builder.mutation<{ message: string }, { id: string; status: UserStatus }>({
      query: ({ id, status }) => ({
        url: `/users/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => ["User", { type: "User", id }],
    }),
    updateUserPlan: builder.mutation<{ message: string }, { id: string; plan: PlanName; planExpiresAt: string | null }>({
      query: ({ id, ...body }) => ({
        url: `/users/${id}/plan`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => ["User", { type: "User", id }],
    }),
    updateUserSeats: builder.mutation<{ message: string }, { id: string; extraSeats: number }>({
      query: ({ id, extraSeats }) => ({
        url: `/users/${id}/seats`,
        method: "PATCH",
        body: { extraSeats },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "User", id }],
    }),
    deleteUser: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useListUsersQuery,
  useGetUserQuery,
  useUpdateUserStatusMutation,
  useUpdateUserPlanMutation,
  useUpdateUserSeatsMutation,
  useDeleteUserMutation,
} = adminUsersApi;
