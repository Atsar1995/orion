/** Mock alert severity for dashboard presentation. */
export type MockAlertSeverity = "critical" | "high" | "medium" | "low";

export type MockAlertItem = {
  readonly id: string;
  readonly severity: MockAlertSeverity;
  readonly message: string;
  readonly category: string;
};

/** Mock alerts widget payload. */
export type MockAlertsData = {
  readonly items: readonly MockAlertItem[];
  readonly activeCount: number;
};

export type MockPriorityItem = {
  readonly id: string;
  readonly rank: number;
  readonly title: string;
  readonly workspace: string;
};

/** Mock priorities widget payload. */
export type MockPrioritiesData = {
  readonly items: readonly MockPriorityItem[];
};

export const MOCK_ALERTS: MockAlertsData = {
  activeCount: 2,
  items: [
    {
      id: "alert-guest-305",
      severity: "critical",
      message: "Guest complaint awaiting response — Room 305",
      category: "Hospitality",
    },
    {
      id: "alert-marketing-roas",
      severity: "high",
      message: "Meta campaign ROAS below target for 48 hours",
      category: "Marketing",
    },
  ],
} as const;

export const MOCK_PRIORITIES: MockPrioritiesData = {
  items: [
    {
      id: "priority-1",
      rank: 1,
      title: "Resolve guest complaint before noon",
      workspace: "Hospitality",
    },
    {
      id: "priority-2",
      rank: 2,
      title: "Review boutique occupancy recovery plan",
      workspace: "Hospitality",
    },
    {
      id: "priority-3",
      rank: 3,
      title: "Approve finance week-close adjustments",
      workspace: "Finance",
    },
  ],
} as const;
