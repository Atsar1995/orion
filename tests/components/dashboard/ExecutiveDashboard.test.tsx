import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { BriefCard } from "@/components/dashboard/BriefCard";
import { BriefingCard } from "@/components/dashboard/BriefingCard";
import { CommandCenterHeader } from "@/components/dashboard/CommandCenterHeader";
import { DashboardGrid, DashboardGridItem } from "@/components/dashboard/DashboardGrid";
import { HealthScore } from "@/components/dashboard/HealthScore";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ModulePreviewCard } from "@/components/dashboard/ModulePreviewCard";
import { OrionIntelligence } from "@/components/dashboard/OrionIntelligence";
import { PlatformHealthCard } from "@/components/dashboard/PlatformHealthCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { AlertPanel } from "@/components/dashboard/AlertPanel";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { TaskList } from "@/components/dashboard/TaskList";
import { mockDashboardSnapshot } from "../../fixtures/dashboard-snapshot";

describe("Executive Dashboard components", () => {
  it("renders metric card with label, value, and trend change", () => {
    render(
      <MetricCard
        label="Revenue"
        value="₹42.8L"
        change="+8.2%"
        trend="up"
        workspace="Finance"
      />,
    );

    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("₹42.8L")).toBeInTheDocument();
    expect(screen.getByText("+8.2%")).toBeInTheDocument();
    expect(screen.getByText("Finance")).toBeInTheDocument();
  });

  it("renders recommendation card with priority and description", () => {
    render(
      <RecommendationCard recommendation={mockDashboardSnapshot.recommendations[0]!} />,
    );

    expect(screen.getByText("Priority 1")).toBeInTheDocument();
    expect(screen.getByText("Resolve guest complaint")).toBeInTheDocument();
    expect(screen.getByText(/Room 305 complaint/)).toBeInTheDocument();
  });

  it("renders alert card with severity indicator and message", () => {
    render(<AlertCard alert={mockDashboardSnapshot.alerts[0]!} />);

    expect(screen.getByText(/Guest complaint awaiting response/)).toBeInTheDocument();
    expect(screen.getByText("Operational")).toBeInTheDocument();
  });

  it("renders alert panel sections and counts from service snapshot", () => {
    render(<AlertPanel panel={mockDashboardSnapshot.alertPanel} />);

    expect(screen.getByText("Critical Alerts")).toBeInTheDocument();
    expect(screen.getByText("Recent Alerts")).toBeInTheDocument();
    expect(screen.getByText("Resolved Alerts")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
  });

  it("renders empty resolved alerts state in alert panel", () => {
    render(
      <AlertPanel
        panel={{
          ...mockDashboardSnapshot.alertPanel,
          resolved: [],
        }}
      />,
    );

    expect(screen.getByText("No recently resolved alerts.")).toBeInTheDocument();
  });

  it("renders executive brief card with headline and body", () => {
    render(<BriefCard brief={mockDashboardSnapshot.brief} />);

    expect(screen.getByText("Daily Executive Brief")).toBeInTheDocument();
    expect(
      screen.getByText(/Platform health aggregated from registered workspace providers/),
    ).toBeInTheDocument();
  });

  it("renders health score with drivers and summary", () => {
    render(<HealthScore health={mockDashboardSnapshot.businessHealth} />);

    expect(screen.getByText("Executive Score")).toBeInTheDocument();
    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getByText("Finance")).toBeInTheDocument();
    expect(screen.getByText("Hospitality")).toBeInTheDocument();
  });

  it("renders task list from structured tasks and string fallbacks", () => {
    const { rerender } = render(<TaskList tasks={mockDashboardSnapshot.tasks} />);

    expect(screen.getByText("Confirm VIP arrivals")).toBeInTheDocument();

    rerender(<TaskList tasks={["Review pipeline", "Approve budget"]} />);

    expect(screen.getByText("Review pipeline")).toBeInTheDocument();
    expect(screen.getByText("Approve budget")).toBeInTheDocument();
  });

  it("renders dashboard grid variants and span classes", () => {
    render(
      <DashboardGrid variant="metrics">
        <DashboardGridItem span="score">Score</DashboardGridItem>
        <DashboardGridItem span="metric">Metric</DashboardGridItem>
      </DashboardGrid>,
    );

    expect(screen.getByText("Score")).toBeInTheDocument();
    expect(screen.getByText("Metric")).toBeInTheDocument();
  });

  it("renders section header with optional subtitle and action", () => {
    render(
      <SectionHeader
        title="Executive Overview"
        subtitle="Live intelligence snapshot"
        action={<button type="button">Refresh</button>}
      />,
    );

    expect(screen.getByRole("heading", { name: "Executive Overview" })).toBeInTheDocument();
    expect(screen.getByText("Live intelligence snapshot")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Refresh" })).toBeInTheDocument();
  });

  it("renders static command center widgets", () => {
    render(
      <>
        <CommandCenterHeader />
        <BriefingCard />
        <PlatformHealthCard />
        <ModulePreviewCard title="Commerce" />
        <QuickActionsCard />
      </>,
    );

    expect(screen.getByText("ORION Command Center")).toBeInTheDocument();
    expect(screen.getByText("Today's Executive Briefing")).toBeInTheDocument();
    expect(screen.getByText("Platform Health")).toBeInTheDocument();
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Engineering" })).toHaveAttribute(
      "href",
      "/engineering",
    );
  });

  it("renders ORION intelligence panel and accepts user query input", async () => {
    const user = userEvent.setup();

    render(<OrionIntelligence />);

    expect(screen.getByText("ORION Intelligence")).toBeInTheDocument();
    expect(screen.getByText("Today's Summary")).toBeInTheDocument();
    expect(screen.getByText("Increase room pricing")).toBeInTheDocument();

    const input = screen.getByPlaceholderText("Ask ORION anything...");
    await user.type(input, "What is occupancy today?");

    expect(input).toHaveValue("What is occupancy today?");
  });
});
