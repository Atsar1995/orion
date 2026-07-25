import type { DashboardSnapshot } from "@/types/intelligence";

export const mockDashboardSnapshot: DashboardSnapshot = {
  businessHealth: {
    score: 80,
    maxScore: 100,
    trend: "+3",
    status: "attention",
    summary: "Platform health aggregated from registered workspace providers.",
    drivers: [
      { label: "Finance", status: "healthy" },
      { label: "Hospitality", status: "attention" },
    ],
  },
  metrics: {
    revenue: {
      id: "metric-revenue",
      label: "Revenue",
      value: "₹42.8L",
      change: "+8.2%",
      trend: "up",
      workspace: "Finance",
    },
    occupancy: {
      id: "metric-occupancy",
      label: "Occupancy",
      value: "84%",
      change: "+6 pts",
      trend: "up",
      workspace: "Hospitality",
    },
    customer: {
      id: "metric-customer",
      label: "Customer Metrics",
      value: "312 active",
      change: "+14",
      trend: "up",
      workspace: "CRM",
    },
    marketing: {
      id: "metric-marketing",
      label: "Marketing Metrics",
      value: "4.2× ROAS",
      change: "-0.3",
      trend: "down",
      workspace: "Marketing",
    },
  },
  brief: {
    headline: "Daily Executive Brief",
    body: "Platform health aggregated from registered workspace providers.",
    generatedAt: "2026-07-25T10:00:00.000Z",
  },
  recommendations: [
    {
      id: "rec-1",
      priority: 1,
      title: "Resolve guest complaint",
      description: "Address Room 305 complaint.",
      category: "risk",
    },
  ],
  alerts: [
    {
      id: "alert-1",
      severity: "critical",
      message: "Guest complaint awaiting response",
      category: "operational",
    },
  ],
  alertPanel: {
    critical: [
      {
        id: "alert-1",
        severity: "critical",
        message: "Guest complaint awaiting response",
        category: "operational",
      },
    ],
    recent: [
      {
        id: "alert-1",
        severity: "critical",
        message: "Guest complaint awaiting response",
        category: "operational",
      },
    ],
    resolved: [],
    counts: {
      total: 1,
      critical: 1,
      high: 0,
      medium: 0,
      low: 0,
      information: 0,
      active: 1,
      resolved: 0,
      escalated: 0,
    },
  },
  tasks: [{ id: "task-1", title: "Confirm VIP arrivals" }],
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
};
