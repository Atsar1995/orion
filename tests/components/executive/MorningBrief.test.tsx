import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { BriefPageContent } from "@/components/executive/BriefPageContent";
import { BusinessHealthCard } from "@/components/executive/BusinessHealthCard";
import { CriticalAlertsSection } from "@/components/executive/CriticalAlertsSection";
import { ExecutiveRecommendationCard } from "@/components/executive/ExecutiveRecommendationCard";
import { ExplainabilityDrawer } from "@/components/executive/ExplainabilityDrawer";
import { mockBriefView } from "../../fixtures/brief-view";

describe("Morning Executive Brief components", () => {
  it("renders full brief page content from BriefView", () => {
    render(<BriefPageContent brief={mockBriefView} />);

    expect(screen.getByRole("heading", { name: "Morning Executive Brief" })).toBeInTheDocument();
    expect(screen.getByText(/Your business opens today in a stable position/)).toBeInTheDocument();
    expect(screen.getByLabelText("Business health")).toBeInTheDocument();
    expect(screen.getByText("Critical Alerts (2)")).toBeInTheDocument();
    expect(screen.getByText("AI Executive Summary")).toBeInTheDocument();
    expect(screen.getByText("Brief Complete")).toBeInTheDocument();
  });

  it("renders business health card with score and domains", () => {
    render(<BusinessHealthCard health={mockBriefView.businessHealth} />);

    expect(screen.getByText("82")).toBeInTheDocument();
    expect(screen.getByText("Finance")).toBeInTheDocument();
    expect(screen.getByText("Why this score?")).toBeInTheDocument();
  });

  it("renders empty critical alerts state", () => {
    render(<CriticalAlertsSection alerts={[]} />);

    expect(screen.getByText("All clear")).toBeInTheDocument();
  });

  it("renders recommendation card with evidence and actions", () => {
    render(
      <ExecutiveRecommendationCard recommendation={mockBriefView.recommendations[0]!} featured />,
    );

    expect(
      screen.getByText("Resolve guest complaint before VIP check-in at 2 PM"),
    ).toBeInTheDocument();
    expect(screen.getByText("Act Now")).toBeInTheDocument();
    expect(screen.getByText(/CRM/)).toBeInTheDocument();
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
});
