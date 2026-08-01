import type { OrganizationProfile } from "@/lib/identity/types";
import { OrganizationStatus } from "@/types/auth";

/** Demo organization for alpha environments (Mission S1A). */
export const DEMO_ORGANIZATION: OrganizationProfile = {
  id: "org-orania",
  name: "ORANIA Hospitality Group",
  slug: "orania",
  status: OrganizationStatus.Active,
  branding: {
    displayName: "ORANIA",
    primaryColor: "#D4AF37",
    logoLabel: "ORANIA",
  },
  timeZone: "Asia/Kolkata",
  locale: "en-IN",
  defaultSettings: {
    currency: "INR",
    dateFormat: "DD/MM/YYYY",
    executiveLanding: "/brief",
  },
};
