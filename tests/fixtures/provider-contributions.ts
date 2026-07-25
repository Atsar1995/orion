import type { ProviderDashboardContribution } from "@/types/providers";

export const mockProviderContributions: ProviderDashboardContribution[] = [
  {
    providerId: "finance",
    workspace: "Finance",
    metric: {
      id: "metric-revenue",
      label: "Revenue",
      value: "₹42.8L",
      change: "+8.2%",
      trend: "up",
      workspace: "Finance",
    },
    healthDriver: { label: "Finance", status: "healthy" },
    trends: [
      {
        id: "trend-revenue",
        label: "Revenue",
        currentValue: "₹42.8L",
        previousValue: "₹39.6L",
        direction: "up",
        period: "7d",
        workspace: "Finance",
      },
    ],
    tasks: [{ id: "task-finance", title: "Review cash flow" }],
  },
  {
    providerId: "hospitality",
    workspace: "Hospitality",
    metric: {
      id: "metric-occupancy",
      label: "Occupancy",
      value: "84%",
      change: "+6 pts",
      trend: "up",
      workspace: "Hospitality",
    },
    healthDriver: { label: "Hospitality", status: "attention" },
    trends: [
      {
        id: "trend-occupancy",
        label: "Occupancy",
        currentValue: "84%",
        previousValue: "78%",
        direction: "up",
        period: "7d",
        workspace: "Hospitality",
      },
    ],
    tasks: [{ id: "task-hospitality", title: "Confirm VIP arrivals" }],
  },
  {
    providerId: "crm",
    workspace: "CRM",
    metric: {
      id: "metric-customer",
      label: "Customer Metrics",
      value: "312 active",
      change: "+14",
      trend: "up",
      workspace: "CRM",
    },
    healthDriver: { label: "CRM", status: "healthy" },
  },
  {
    providerId: "marketing",
    workspace: "Marketing",
    metric: {
      id: "metric-marketing",
      label: "Marketing Metrics",
      value: "4.2× ROAS",
      change: "-0.3",
      trend: "down",
      workspace: "Marketing",
    },
    healthDriver: { label: "Marketing", status: "attention" },
  },
];
