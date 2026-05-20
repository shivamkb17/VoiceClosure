import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-04-22.dahlia",
});

// Price ID mapping — update with real Stripe Price IDs
export const PRICE_IDS: Record<string, Record<string, string>> = {
  starter: {
    month: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || "price_starter_monthly",
    year: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || "price_starter_yearly",
  },
  pro: {
    month: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "price_pro_monthly",
    year: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "price_pro_yearly",
  },
  agency: {
    month: process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID || "price_agency_monthly",
    year: process.env.STRIPE_AGENCY_YEARLY_PRICE_ID || "price_agency_yearly",
  },
};
