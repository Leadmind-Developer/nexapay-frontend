// lib/promo.config.ts
export type PromoPage =
  | "dashboard"
  | "electricity"
  | "data"
  | "airtime"
  | "education"
  | "insurance"
  | "int-airtime"
  | "cable";

interface PromoContent {
  title: string;
  message: string;
  badge?: string;
}

export const PROMO_RULES: Record<PromoPage, PromoContent> = {
  dashboard: {
    title: "👋 Welcome to Nexa",
    message: "Pay bills, buy airtime & manage your wallet in one place.",
    badge: "Dashboard",
  },

  electricity: {
    title: "⚡ Pay Electricity with Nexa",
    message: "Instant token delivery with zero downtime.",
    badge: "Bills",
  },
  data: {
    title: "📶 Data Deals",
    message: "Buy data faster & enjoy exclusive discounts.",
    badge: "Data",
  },
  airtime: {
    title: "📞 Airtime Top-Up",
    message: "Instant airtime with cashback rewards.",
    badge: "Airtime",
  },
  education: {
    title: "🎓 Education Payments",
    message: "Pay school & exam fees seamlessly.",
    badge: "Education",
  },
  insurance: {
    title: "🛡️ Insurance Made Easy",
    message: "Protect what matters — quick & secure.",
    badge: "Insurance",
  },
  "int-airtime": {
    title: "🌍 International Airtime",
    message: "Send airtime abroad instantly.",
    badge: "Global",
  },
  cable: {
    title: "📺 TV & Cable Subscription",
    message: "Renew DSTV, GOTV & Startimes instantly.",
    badge: "Cable",
  },
};
