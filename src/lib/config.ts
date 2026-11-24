export const SITE = {
  name: "CMD Cashews",
  shortName: "CMD",
  tagline: "Roasted in Negombo since 1996",
  description:
    "Premium Sri Lankan cashews roasted in Negombo since 1996. Devilled, burnt, garlic & pepper, ghee-fried and raw cashews by the kilo. Free delivery in Negombo.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://cmdcashews.lk").replace(/\/$/, ""),
  founded: 1996,
  city: "Negombo",
  country: "Sri Lanka",
  currency: "LKR",
};

/** Digits only, international format, e.g. 94771234567 */
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");

export const BANK = {
  bank: "Commercial Bank",
  branch: "Negombo",
  accountName: "M. Arachchige Samudra Daham Malimbada",
  accountNumber: "8014365511",
};

export const DELIVERY = {
  negombo: { label: "Negombo area", fee: 0, note: "Free delivery" },
  island: { label: "Rest of Sri Lanka", fee: null as number | null, note: "Courier charge confirmed on WhatsApp" },
} as const;

export type DeliveryZone = keyof typeof DELIVERY;
