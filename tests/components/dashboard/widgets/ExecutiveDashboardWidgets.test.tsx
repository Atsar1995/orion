import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  AlertCenterWidget,
  BusinessHealthWidget,
  ConfidenceWidget,
  ExecutiveNarrativeWidget,
  KPIHighlightsWidget,
  MorningBriefWidget,
  PrioritiesWidget,
  RecommendationPreviewWidget,
} from "@/components/dashboard/widgets";
import {
  MOCK_BUSINESS_HEALTH,
  MOCK_CONFIDENCE,
  MOCK_EXECUTIVE_NARRATIVE,
  MOCK_KPIS,
  MOCK_MORNING_BRIEF,
  MOCK_PRIORITIES,
  MOCK_RECOMMENDATIONS,
} from "@/lib/dashboard/mock";
import { createMockAlertCenterSnapshot } from "@/lib/alerts/mock";

describe("EP-002 executive dashboard widgets", () => {
  it("renders business health widget from mock data", () => {
    render(<BusinessHealthWidget data={MOCK_BUSINESS_HEALTH} />);

    expect(screen.getByText("Business Health")).toBeInTheDocument();
    expect(screen.getByText("82")).toBeInTheDocument();
    expect(screen.getByText("Finance")).toBeInTheDocument();
  });

  it("renders confidence widget from mock data", () => {
    render(<ConfidenceWidget data={MOCK_CONFIDENCE} />);

    expect(screen.getByText("Confidence")).toBeInTheDocument();
    expect(screen.getByText("86%")).toBeInTheDocument();
  });

  it("renders morning brief widget with link to full brief", () => {
    render(<MorningBriefWidget data={MOCK_MORNING_BRIEF} />);

    expect(screen.getByText("Morning Executive Brief")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open full brief" })).toHaveAttribute("href", "/brief");
  });

  it("renders alert center and priorities widgets", () => {
    render(
      <>
        <AlertCenterWidget snapshot={createMockAlertCenterSnapshot()} />
        <PrioritiesWidget data={MOCK_PRIORITIES} />
      </>,
    );

    expect(screen.getByText("Executive Alert Center")).toBeInTheDocument();
    expect(screen.getByText("Guest complaint awaiting response")).toBeInTheDocument();
    expect(screen.getByText("Resolve guest complaint before noon")).toBeInTheDocument();
  });

  it("renders KPI, narrative, and recommendation widgets", () => {
    render(
      <>
        <KPIHighlightsWidget data={MOCK_KPIS} />
        <ExecutiveNarrativeWidget data={MOCK_EXECUTIVE_NARRATIVE} />
        <RecommendationPreviewWidget data={MOCK_RECOMMENDATIONS} />
      </>,
    );

    expect(screen.getByText("₹42.8L")).toBeInTheDocument();
    expect(screen.getByText(/Finance continues to outperform/)).toBeInTheDocument();
    expect(screen.getByText("Respond to guest escalation")).toBeInTheDocument();
  });
});
