import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../baseQuery";

export type PricingCurrency = "INR" | "USD";
export type PaidPlan = "starter" | "pro" | "agency";
export type BillingCycle = "monthly" | "annual";

/** Amounts in paise (INR) / cents (USD). */
export type Money = Record<PricingCurrency, number>;

export interface PricingConfig {
  plans: Record<PaidPlan, Record<BillingCycle, Money>>;
  team: {
    includedSeats: number;
    maxSeats: number;
    seatPriceMonthly: Money;
  };
}

export interface PricingSettingsResponse {
  pricing: PricingConfig & { updatedAt: string | null; updatedBy: string | null };
  /** Highest number of extra seats any customer currently has */
  highestExtraSeats: number;
}

export const adminSettingsApi = createApi({
  reducerPath: "adminSettingsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Pricing"],
  endpoints: (builder) => ({
    getPricingSettings: builder.query<PricingSettingsResponse, void>({
      query: () => "/settings/pricing",
      providesTags: ["Pricing"],
    }),
    updatePricingSettings: builder.mutation<{ message: string }, PricingConfig>({
      query: (body) => ({ url: "/settings/pricing", method: "PUT", body }),
      invalidatesTags: ["Pricing"],
    }),
  }),
});

export const { useGetPricingSettingsQuery, useUpdatePricingSettingsMutation } = adminSettingsApi;
