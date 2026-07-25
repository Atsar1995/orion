import { USER } from "@/lib/constants";
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
        actions: ["act", "delegate", "snooze", "explain"],
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
        actions: ["act", "delegate", "snooze", "explain"],
      },
    ],
    priorities: [
      { id: "pri-1", rank: 1, title: "Resolve Room 305 guest complaint" },
      { id: "pri-2", rank: 2, title: "Approve supplier payment · ₹1.2L" },
      { id: "pri-3", rank: 3, title: "Review weekend room rates for ORANIA" },
      { id: "pri-4", rank: 4, title: "Sign off ATSAR quotation #Q-1042" },
    ],
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
