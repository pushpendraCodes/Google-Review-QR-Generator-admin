import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";
import type { PlanName } from "./adminDashboardApi";
import { cleanParams } from "./adminRevenueApi";

export type QRStatusFilter = "live" | "paused" | "archived";
export type QRSort = "newest" | "oldest" | "scans" | "rating" | "reviews";

type DailyPoint = { date: string; value: number };
type DeviceRow = { device: "iOS" | "Android" | "Desktop" | "Other"; count: number };
type CityRow = { city: string; country: string; count: number };

export interface QRStats {
  total: number;
  active: number;
  archived: number;
  paused: number;
  neverScanned: number;
  totalScans: number;
  totalReviews: number;
  avgRating: number;
  avgScans: number;
  scansThisMonth: number;
  scansGrowth: string | null;
  scanSeries: DailyPoint[];
  devices: DeviceRow[];
  topCities: CityRow[];
}

interface QROwner {
  _id: string;
  name?: string;
  email?: string;
  businessName?: string;
  plan?: PlanName;
  planExpiresAt?: string | null;
  picture?: string;
  status?: "active" | "block";
}

export interface AdminQRCode {
  _id: string;
  businessName: string;
  label?: string;
  placeAddress?: string;
  placeRating?: number;
  totalReviews?: number;
  scanCount: number;
  status: "active" | "archived";
  isActive?: boolean;
  shortCode: string;
  owner?: QROwner | null;
  qrConfig?: { logoUrl?: string; color?: string };
  createdAt: string;
  lastScanAt: string | null;
  scans7d: number;
}

export interface QRDetails {
  qr: Omit<AdminQRCode, "lastScanAt" | "scans7d"> & {
    placeId: string;
    reviewUrl: string;
    googleSyncedAt?: string | null;
    hasWatermark?: boolean;
    latestReviews?: { authorName?: string; rating?: number; text?: string; time?: number }[];
    updatedAt: string;
  };
  scanSeries: DailyPoint[];
  devices: DeviceRow[];
  topCities: CityRow[];
  stats: { scansLast30: number; firstScanAt: string | null; lastScanAt: string | null; loggedScans: number };
}

export interface QRScanRow {
  _id: string;
  scannedAt: string;
  city?: string;
  country?: string;
  device: DeviceRow["device"];
}

type Paginated = { pagination: { total: number; page: number; limit: number; totalPages: number } };

export const adminQRCodesApi = createApi({
  reducerPath: "adminQRCodesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["QR"],
  endpoints: (builder) => ({
    getQRStats: builder.query<QRStats, void>({
      query: () => "/qrcodes/stats",
      providesTags: ["QR"],
    }),
    listQRCodes: builder.query<
      { qrCodes: AdminQRCode[] } & Paginated,
      { page: number; limit: number; search?: string; status?: QRStatusFilter | ""; plan?: PlanName | ""; sort?: QRSort }
    >({
      query: (params) => ({ url: "/qrcodes", params: cleanParams(params) }),
      providesTags: ["QR"],
    }),
    getQRCode: builder.query<QRDetails, string>({
      query: (id) => `/qrcodes/${id}`,
      providesTags: (_r, _e, id) => [{ type: "QR", id }],
    }),
    listQRScans: builder.query<{ scans: QRScanRow[] } & Paginated, { id: string; page: number; limit: number }>({
      query: ({ id, ...params }) => ({ url: `/qrcodes/${id}/scans`, params }),
    }),
    setQRActive: builder.mutation<{ message: string; isActive: boolean }, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({ url: `/qrcodes/${id}/active`, method: "PATCH", body: { isActive } }),
      invalidatesTags: (_r, _e, { id }) => ["QR", { type: "QR", id }],
    }),
  }),
});

export const {
  useGetQRStatsQuery,
  useListQRCodesQuery,
  useGetQRCodeQuery,
  useListQRScansQuery,
  useSetQRActiveMutation,
} = adminQRCodesApi;
