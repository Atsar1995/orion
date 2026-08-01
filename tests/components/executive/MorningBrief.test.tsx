import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BriefPageContent } from "@/components/executive/BriefPageContent";
import { BusinessHealthCard } from "@/components/executive/BusinessHealthCard";
import { CriticalAlertsSection } from "@/components/executive/CriticalAlertsSection";
import { ExecutiveRecommendationCard } from "@/components/executive/ExecutiveRecommendationCard";
import { ExplainabilityDrawer } from "@/components/executive/ExplainabilityDrawer";
import { mockBriefView } from "../../fixtures/brief-view";

describe("Morning Executive Brief components", () => {
  it("renders full brief page content from BriefView", () => {
    render(<BriefPageContent brief={mockBriefView} />);

    expect(
      screen.getByRole("heading", { name: "Your business opens today in a stable position." }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Business health")).toBeInTheDocument();
    expect(screen.getByText("Requires Attention (2)")).toBeInTheDocument();
    expect(screen.getByText("Recommendations")).toBeInTheDocument();
    expect(screen.getByText("Morning Brief")).toBeInTheDocument();
    expect(screen.getByText("Executive Decisions")).toBeInTheDocument();
    expect(screen.getByText("AI Executive Summary")).toBeInTheDocument();
    expect(screen.getByText("You're Oriented")).toBeInTheDocument();
    expect(screen.getByText("Brief ready")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Brief sections" })).toBeInTheDocument();
  });

  it("renders business health card with score, domains, and explainability", async () => {
    const user = userEvent.setup();

    render(<BusinessHealthCard health={mockBriefView.businessHealth} />);

    expect(screen.getByText("82")).toBeInTheDocument();
    expect(screen.getByText("CRM")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Why this score?" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Show 2 healthy domains" }));
    expect(screen.getByText("Finance")).toBeInTheDocument();
  });

  it("renders empty critical alerts state", () => {
    render(<CriticalAlertsSection alerts={[]} />);

    expect(screen.getByText("All clear")).toBeInTheDocument();
  });

  it("caps critical alerts with view-all expansion", async () => {
    const user = userEvent.setup();
    const alerts = [
      ...mockBriefView.criticalAlerts,
      {
        id: "alert-3",
        severity: "attention" as const,
        message: "Marketing sessions dipped overnight",
        category: "Marketing",
      },
      {
        id: "alert-4",
        severity: "attention" as const,
        message: "Weekend rates need review",
        category: "Hospitality",
      },
    ];

    render(<CriticalAlertsSection alerts={alerts} maxVisible={3} />);

    expect(screen.getByText("View all 4 alerts")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "View all 4 alerts" }));
    expect(screen.getByText("Weekend rates need review")).toBeInTheDocument();
  });

  it("renders recommendation card with evidence and actions", () => {
    render(
      <ExecutiveRecommendationCard recommendation={mockBriefView.recommendations[0]!} featured />,
    );

    expect(
      screen.getByText("Resolve guest complaint before VIP check-in at 2 PM"),
    ).toBeInTheDocument();
    expect(screen.getByText("Accept")).toBeInTheDocument();
    expect(screen.getByText(/CRM/)).toBeInTheDocument();
  });

  it("opens recommendation explainability from the action bar", async () => {
    const user = userEvent.setup();

    render(
      <ExecutiveRecommendationCard recommendation={mockBriefView.recommendations[0]!} featured />,
    );

    await user.click(screen.getByRole("button", { name: "Why am I seeing this?" }));
    expect(screen.getByText("Hide explanation")).toBeInTheDocument();
  });

  it("toggles explainability drawer", async () => {
    const user = userEvent.setup();

    render(
      <ExplainabilityDrawer
        explanation={{
          question: "why-this-score",
          title: "Why this score?",
          summary: "Score reflects revenue and occupancy strength with marketing dip.",
          factors: ["Revenue ahead of plan", "Occupancy above target"],
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Why this score?" }));
    expect(screen.getByText("Revenue ahead of plan")).toBeInTheDocument();
  });

  it("matches desktop layout for AI summary", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("max-width"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );

    render(<BriefPageContent brief={mockBriefView} />);

    expect(screen.getByText(mockBriefView.aiSummary.narrative)).toBeInTheDocument();
  });
});
