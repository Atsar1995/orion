import { USER } from "@/lib/constants";
import { DEMO_ORGANIZATION } from "@/lib/identity/data/demo-organizations";
import type { BriefView } from "@/types/executive";

const EXECUTIVE_FIRST_NAME = USER.name.split(" ")[0] ?? USER.name;

function buildGreetingPeriod(date: Date): string {
  const hour = date.getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

function formatBriefDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatSyncTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Realistic mock Morning Executive Brief aligned with EC-001 wireframe. */
export function buildMockMorningBriefView(referenceDate = new Date()): BriefView {
  const generatedAt = referenceDate.toISOString();
  const syncTime = formatSyncTime(
    new Date(referenceDate.getTime() - 18 * 60 * 1000),
  );

  return {
    id: "brief-mock-2026-07-25",
    generatedAt,
    lastSyncedAt: syncTime,
    lifecycle: "fresh",
    greeting: {
      period: buildGreetingPeriod(referenceDate),
      executiveName: EXECUTIVE_FIRST_NAME,
      headline: "Your business opens today in a stable position.",
      subheadline: "One item needs your judgment before noon.",
      dateLabel: formatBriefDate(referenceDate),
      organizationName: DEMO_ORGANIZATION.name,
      profileLabel: "Executive",
      operatingMode: "standard",
    },
    businessHealth: {
      score: 82,
      maxScore: 100,
      trend: "+4 pts",
      trendDirection: "up",
      status: "healthy",
      summary:
        "Revenue and occupancy are ahead of plan. Marketing sessions dipped overnight — monitor before weekend campaigns launch.",
      domains: [
        { id: "finance", label: "Finance", status: "healthy", summary: "Cash flow positive" },
        { id: "crm", label: "CRM", status: "attention", summary: "2 guest reviews pending" },
        { id: "ops", label: "Operations", status: "healthy", summary: "84% occupancy" },
        { id: "marketing", label: "Marketing", status: "attention", summary: "Sessions -8% vs 7d" },
      ],
      explanationAvailable: true,
      majorRisks: [
        {
          id: "risk-guest",
          label: "Customer Experience",
          summary: "Guest complaint · Room 305 · awaiting founder response",
          severity: "critical",
        },
      ],
      majorOpportunities: [
        {
          id: "opp-weekend",
          label: "Hospitality",
          summary: "Weekend occupancy ahead of plan — rate optimization opportunity",
          severity: "positive",
        },
      ],
    },
    criticalAlerts: [
      {
        id: "alert-guest-305",
        severity: "critical",
        message: "Guest complaint · Room 305 · awaiting founder response",
        category: "Customer Experience",
        ageLabel: "9h open",
      },
      {
        id: "alert-supplier-pay",
        severity: "critical",
        message: "Supplier payment overdue · ₹1.2L · due today",
        category: "Finance",
        ageLabel: "2d overdue",
      },
    ],
    overnightChanges: [
      {
        id: "change-occupancy",
        label: "Occupancy",
        value: "+6 pts",
        direction: "up",
      },
      {
        id: "change-sessions",
        label: "Sessions",
        value: "-8% GA4",
        direction: "down",
      },
      {
        id: "change-pipeline",
        label: "Pipeline",
        value: "+₹2.1L",
        direction: "up",
      },
    ],
    recommendations: [
      {
        id: "rec-guest-305",
        priority: 1,
        priorityLabel: "Priority 1 · High",
        title: "Resolve guest complaint before VIP check-in at 2 PM",
        description:
          "Room 305 complaint is unresolved and the guest is flagged as VIP arrival this afternoon.",
        impact: "Protect review score and repeat booking probability.",
        category: "risk",
        evidence: [
          {
            id: "ev-crm-305",
            type: "event",
            source: "CRM",
            label: "Guest sentiment",
            value: "Negative · Room 305",
          },
          {
            id: "ev-cal-vip",
            type: "calendar",
            source: "Calendar",
            label: "VIP arrival",
            value: "Today · 2:00 PM",
          },
        ],
        confidence: { value: 94, label: "high" },
        actions: ["act", "delegate", "defer", "reject", "complete", "explain"],
        businessValue: "Protect review score and repeat booking probability.",
        riskLevel: "high",
        recommendedAction: "Call operations lead before 11 AM",
        alternativeActions: ["Delegate to guest relations", "Defer until after VIP arrival"],
        expectedOutcome: "Guest complaint resolved before VIP check-in at 2 PM.",
        href: "/crm/customers/orania-hospitality-group",
      },
      {
        id: "rec-supplier-payment",
        priority: 2,
        priorityLabel: "Priority 2 · High",
        title: "Approve supplier payment to avoid delivery disruption",
        description:
          "Kitchen supplies vendor payment is overdue and flagged for same-day settlement.",
        impact: "Prevent stock-out before weekend occupancy peak.",
        category: "executive",
        evidence: [
          {
            id: "ev-fin-inv",
            type: "document",
            source: "Finance",
            label: "Invoice",
            value: "₹1.2L · Due today",
          },
        ],
        confidence: { value: 88, label: "high" },
        actions: ["act", "delegate", "defer", "reject", "complete", "explain"],
        businessValue: "Prevent stock-out before weekend occupancy peak.",
        riskLevel: "medium",
        recommendedAction: "Approve payment today",
        alternativeActions: ["Delegate to finance lead", "Negotiate extended terms"],
        expectedOutcome: "Supplier delivery continues without disruption.",
        href: "/finance/payables",
      },
    ],
    priorities: [
      { id: "pri-1", rank: 1, title: "Resolve Room 305 guest complaint" },
      { id: "pri-2", rank: 2, title: "Approve supplier payment · ₹1.2L" },
      { id: "pri-3", rank: 3, title: "Review weekend room rates for ORANIA" },
      { id: "pri-4", rank: 4, title: "Sign off ATSAR quotation #Q-1042" },
    ],
    priorityDecisions: [
      {
        id: "pri-dec-1",
        rank: 1,
        title: "Resolve Room 305 guest complaint",
        priority: 1,
        confidence: { value: 94, label: "high" },
        businessImpact: "Protect review score and repeat booking probability.",
        recommendedAction: "Call operations lead before 11 AM",
        evidence: [
          {
            id: "ev-crm-305",
            type: "event",
            source: "CRM",
            label: "Guest sentiment",
            value: "Negative · Room 305",
          },
        ],
        href: "/crm/customers/orania-hospitality-group",
      },
    ],
    executiveDecisions: {
      pending: [
        {
          id: "dec-pending-1",
          title: "Supplier contract renegotiation",
          status: "recommended",
          href: "/decisions",
          priority: 1,
        },
      ],
      delegated: [
        {
          id: "dec-delegated-1",
          title: "Escalate pipeline risk — Q3 forecast",
          status: "delegated",
          href: "/decisions",
          delegatedTo: "Sales Lead",
        },
      ],
      awaitingReview: [],
      recentlyCompleted: [
        {
          id: "dec-completed-1",
          title: "Renew enterprise contract — Apex Retail",
          status: "completed",
          href: "/decisions",
        },
      ],
    },
    crossWorkspaceSignals: [
      {
        workspaceId: "crm",
        label: "CRM",
        status: "live",
        summary: "Pipeline and guest signals active.",
        href: "/crm",
        signalCount: 4,
      },
      {
        workspaceId: "finance",
        label: "Finance",
        status: "live",
        summary: "Cash flow and payables monitored.",
        href: "/finance",
        signalCount: 3,
      },
      {
        workspaceId: "hospitality",
        label: "Hospitality",
        status: "partial",
        summary: "Occupancy strong; full integration pending.",
        href: "/hospitality",
        signalCount: 1,
      },
    ],
    executiveMemory: [
      {
        id: "mem-1",
        type: "decision",
        title: "Renew enterprise contract — Apex Retail",
        detail: "Value captured: 18400 USD",
        recordedAt: generatedAt,
        href: "/decisions",
      },
      {
        id: "mem-2",
        type: "pattern",
        title: "Executive decisions convert faster on CRM signals",
        detail: "CRM-origin recommendations show higher acceptance this week.",
      },
    ],
    businessTrends: [
      {
        id: "trend-occupancy",
        label: "Occupancy",
        direction: "positive",
        summary: "Occupancy moved +6 pts overnight.",
        confidence: { value: 86, label: "high" },
      },
      {
        id: "trend-sessions",
        label: "Sessions",
        direction: "negative",
        summary: "Marketing sessions dipped 8% vs 7-day average.",
        confidence: { value: 78, label: "medium" },
      },
    ],
    morningSummary: {
      todaySummary:
        "Revenue is ahead of plan (+8.2%). Hospitality occupancy is strong ahead of the weekend. Marketing sessions dipped 8% — campaign review recommended.",
      criticalDecisions: ["Resolve Room 305 guest complaint", "Approve supplier payment · ₹1.2L"],
      businessHealthHeadline: "82/100 — Revenue and occupancy ahead of plan.",
      priorityActions: ["Resolve Room 305 guest complaint", "Approve supplier payment · ₹1.2L"],
      executiveNotes: ["One item needs your judgment before noon.", "First action: Call operations lead"],
    },
    aiSummary: {
      narrative:
        "Revenue is ahead of plan (+8.2%). Hospitality occupancy is strong ahead of the weekend. Marketing sessions dipped 8% — campaign review recommended. Finance has one overdue payable requiring approval today.",
      sources: ["Finance", "Hospitality", "GA4", "CRM", "Calendar"],
      confidence: { value: 91, label: "high" },
      generatedAt,
    },
    endSummary: {
      condition: "Stable",
      priority: "Guest complaint · Room 305",
      firstAction: "Call operations lead",
    },
  };
}

export const MOCK_MORNING_BRIEF_VIEW = buildMockMorningBriefView();
