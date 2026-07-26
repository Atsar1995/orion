/** Mock KPI trend direction for dashboard presentation. */
export type MockKPITrend = "up" | "down" | "flat";

export type MockKPIItem = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly change: string;
  readonly trend: MockKPITrend;
  readonly workspace: string;
};

/** Mock KPI highlights widget payload. */
export type MockKPIData = {
  readonly items: readonly MockKPIItem[];
};

export type MockRecommendationItem = {
  readonly id: string;
  readonly priority: number;
  readonly title: string;
  readonly description: string;
  readonly workspace: string;
};

/** Mock recommendation preview widget payload. */
export type MockRecommendationPreviewData = {
  readonly items: readonly MockRecommendationItem[];
};

export const MOCK_KPIS: MockKPIData = {
  items: [
    {
      id: "kpi-revenue",
      label: "Revenue",
      value: "₹42.8L",
      change: "+8.2%",
      trend: "up",
      workspace: "Finance",
    },
    {
      id: "kpi-occupancy",
      label: "Occupancy",
      value: "84%",
      change: "+6 pts",
      trend: "up",
      workspace: "Hospitality",
    },
    {
      id: "kpi-customers",
      label: "Active Customers",
      value: "312",
      change: "+14",
      trend: "up",
      workspace: "CRM",
    },
    {
      id: "kpi-roas",
      label: "Marketing ROAS",
      value: "4.2×",
      change: "-0.3",
      trend: "down",
      workspace: "Marketing",
    },
  ],
} as const;

export const MOCK_RECOMMENDATIONS: MockRecommendationPreviewData = {
  items: [
    {
      id: "rec-guest-response",
      priority: 1,
      title: "Respond to guest escalation",
      description: "Assign hospitality lead and confirm resolution timeline.",
      workspace: "Hospitality",
    },
    {
      id: "rec-occupancy",
      priority: 2,
      title: "Review boutique pricing",
      description: "Occupancy variance suggests a targeted rate adjustment.",
      workspace: "Hospitality",
    },
    {
      id: "rec-campaign",
      priority: 3,
      title: "Pause underperforming Meta ad set",
      description: "ROAS decline is isolated to one campaign cluster.",
      workspace: "Marketing",
    },
  ],
} as const;
