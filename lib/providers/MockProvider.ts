import { BaseProvider } from "@/lib/providers/BaseProvider";
import { createSuccessResult } from "@/lib/providers/ProviderHealth";
import type {
  DashboardDataProvider,
  ProviderCapability,
  ProviderConfig,
  ProviderDashboardContribution,
  ProviderResult,
} from "@/types/providers";

/** Mock provider base — simulates connect/sync with in-memory dashboard payloads. */
export abstract class MockProvider extends BaseProvider implements DashboardDataProvider {
  protected abstract contribution: ProviderDashboardContribution;

  constructor(config: ProviderConfig) {
    super({ ...config, mock: true });
  }

  abstract getCapabilities(): ProviderCapability[];

  async fetchDashboardContribution(): Promise<ProviderResult<ProviderDashboardContribution>> {
    this.ensureConnected();
    return createSuccessResult(this.id, {
      ...this.contribution,
      providerId: this.id,
    });
  }
}

export class CRMProvider extends MockProvider {
  readonly id = "crm";
  readonly name = "CRM Provider";

  constructor() {
    super({ id: "crm", name: "CRM Provider", enabled: true, workspace: "CRM" });
  }

  protected contribution: ProviderDashboardContribution = {
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
    recommendations: [
      {
        id: "rec-crm-1",
        priority: 2,
        title: "Resolve guest complaint before VIP check-in",
        description: "Room 305 issue threatens satisfaction and review score.",
        category: "risk",
      },
    ],
    trends: [
      {
        id: "trend-pipeline",
        label: "Pipeline Value",
        currentValue: "₹18.2L",
        previousValue: "₹16.9L",
        direction: "up",
        period: "7d",
        workspace: "CRM",
      },
    ],
    briefSegments: ["CRM pipeline grew with 14 new active relationships this week."],
  };

  getCapabilities(): ProviderCapability[] {
    return ["metrics", "recommendations", "trends", "health", "brief"];
  }
}

export class FinanceProvider extends MockProvider {
  readonly id = "finance";
  readonly name = "Finance Provider";

  constructor() {
    super({ id: "finance", name: "Finance Provider", enabled: true, workspace: "Finance" });
  }

  protected contribution: ProviderDashboardContribution = {
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
    alerts: [
      {
        id: "alert-finance-1",
        severity: "attention",
        message: "Supplier payment overdue — housekeeping linens",
        category: "follow-up",
      },
    ],
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
    briefSegments: ["Finance revenue is 8.2% above plan with positive cash flow."],
  };

  getCapabilities(): ProviderCapability[] {
    return ["metrics", "alerts", "trends", "health", "brief"];
  }
}

export class MarketingProvider extends MockProvider {
  readonly id = "marketing";
  readonly name = "Marketing Provider";

  constructor() {
    super({
      id: "marketing",
      name: "Marketing Provider",
      enabled: true,
      workspace: "Marketing",
    });
  }

  protected contribution: ProviderDashboardContribution = {
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
    healthDriver: { label: "Marketing", status: "healthy" },
    recommendations: [
      {
        id: "rec-mkt-1",
        priority: 3,
        title: "Refresh underperforming ad creative",
        description: "Meta campaign CTR declined 12% week-over-week.",
        category: "growth",
      },
    ],
    trends: [
      {
        id: "trend-roas",
        label: "Marketing ROAS",
        currentValue: "4.2×",
        previousValue: "4.5×",
        direction: "down",
        period: "7d",
        workspace: "Marketing",
      },
    ],
    briefSegments: ["Marketing ROAS dipped slightly — campaign review recommended."],
  };

  getCapabilities(): ProviderCapability[] {
    return ["metrics", "recommendations", "trends", "health", "brief"];
  }
}

export class HospitalityProvider extends MockProvider {
  readonly id = "hospitality";
  readonly name = "Hospitality Provider";

  constructor() {
    super({
      id: "hospitality",
      name: "Hospitality Provider",
      enabled: true,
      workspace: "Hospitality",
    });
  }

  protected contribution: ProviderDashboardContribution = {
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
    alerts: [
      {
        id: "alert-hosp-1",
        severity: "critical",
        message: "Guest complaint awaiting response — Room 305",
        category: "operational",
      },
      {
        id: "alert-hosp-2",
        severity: "attention",
        message: "Weekday occupancy below target for Tuesday arrivals",
        category: "risk",
      },
    ],
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
    recommendations: [
      {
        id: "rec-hosp-1",
        priority: 1,
        title: "Increase weekend room rates",
        description: "Demand exceeds forecast with limited premium inventory.",
        category: "executive",
      },
    ],
    briefSegments: ["Hospitality occupancy is trending above target ahead of the weekend."],
  };

  getCapabilities(): ProviderCapability[] {
    return ["metrics", "alerts", "recommendations", "trends", "health", "brief"];
  }
}

export class CommerceProvider extends MockProvider {
  readonly id = "commerce";
  readonly name = "Commerce Provider";

  constructor() {
    super({ id: "commerce", name: "Commerce Provider", enabled: true, workspace: "Commerce" });
  }

  protected contribution: ProviderDashboardContribution = {
    providerId: "commerce",
    workspace: "Commerce",
    healthDriver: { label: "Commerce", status: "healthy" },
    briefSegments: ["Commerce order volume is stable with healthy catalogue availability."],
  };

  getCapabilities(): ProviderCapability[] {
    return ["health", "brief"];
  }
}

export class CalendarProvider extends MockProvider {
  readonly id = "calendar";
  readonly name = "Calendar Provider";

  constructor() {
    super({ id: "calendar", name: "Calendar Provider", enabled: true });
  }

  protected contribution: ProviderDashboardContribution = {
    providerId: "calendar",
    tasks: [
      { id: "task-1", title: "Confirm VIP arrivals" },
      { id: "task-2", title: "Review weekend pricing" },
    ],
    briefSegments: ["Three executive meetings scheduled today."],
  };

  getCapabilities(): ProviderCapability[] {
    return ["calendar", "tasks", "brief"];
  }
}

export class EmailProvider extends MockProvider {
  readonly id = "email";
  readonly name = "Email Provider";

  constructor() {
    super({ id: "email", name: "Email Provider", enabled: true });
  }

  protected contribution: ProviderDashboardContribution = {
    providerId: "email",
    tasks: [
      { id: "task-3", title: "Approve supplier invoice" },
      { id: "task-4", title: "Marketing campaign review" },
      { id: "task-5", title: "Call travel partner" },
    ],
    alerts: [
      {
        id: "alert-email-1",
        severity: "attention",
        message: "Travel partner contract renewal pending signature",
        category: "follow-up",
      },
    ],
    briefSegments: ["Two priority emails require executive response."],
  };

  getCapabilities(): ProviderCapability[] {
    return ["email", "tasks", "alerts", "brief"];
  }
}
