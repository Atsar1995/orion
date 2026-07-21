export type ConfigurationField = {
  label: string;
  value: string;
};

export type NotificationSetting = {
  label: string;
  enabled: boolean;
};

export type IntegrationProvider = {
  name: string;
};

export const CONFIGURATION_SUMMARY = [
  { label: "Organization", value: "Atsar Technologies" },
  { label: "Founder Profile", value: "Mohammad Shafi" },
  { label: "Appearance", value: "Dark Theme" },
  { label: "Integrations", value: "0 Connected" },
] as const;

export const ORGANIZATION_FIELDS: ConfigurationField[] = [
  { label: "Company Name", value: "Atsar Technologies" },
  { label: "Business Type", value: "Technology & Hospitality" },
  { label: "Time Zone", value: "Asia/Kolkata (UTC+5:30)" },
  { label: "Default Currency", value: "INR (₹)" },
];

export const FOUNDER_PROFILE_FIELDS: ConfigurationField[] = [
  { label: "Founder Name", value: "Mohammad Shafi Goroo" },
  { label: "Email", value: "founder@atsar.tech" },
  { label: "Language", value: "English" },
  { label: "Time Zone", value: "Asia/Kolkata (UTC+5:30)" },
];

export const APPEARANCE_FIELDS: ConfigurationField[] = [
  { label: "Theme", value: "Dark (ORION Navy)" },
  { label: "Accent Color", value: "Orion Gold" },
  { label: "Dashboard Layout", value: "Standard" },
];

export const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  { label: "Email Notifications", enabled: true },
  { label: "Push Notifications", enabled: false },
  { label: "Daily Briefing", enabled: true },
  { label: "Weekly Summary", enabled: true },
];

export const AI_PREFERENCE_FIELDS: ConfigurationField[] = [
  { label: "Executive Briefing", value: "Enabled" },
  { label: "Recommendation Level", value: "Balanced" },
  { label: "Automation Mode", value: "Advisory" },
];

export const INTEGRATION_PROVIDERS: IntegrationProvider[] = [
  { name: "Google" },
  { name: "Microsoft" },
  { name: "Shopify" },
  { name: "Meta" },
  { name: "Stripe" },
  { name: "GitHub" },
];

export const CONFIGURATION_QUICK_ACTIONS = [
  "Save Settings",
  "Reset Defaults",
  "Export Configuration",
  "Documentation",
] as const;
