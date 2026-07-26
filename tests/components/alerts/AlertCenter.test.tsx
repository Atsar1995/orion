import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AlertCenter } from "@/components/alerts";
import { createMockAlertCenterSnapshot } from "@/lib/alerts/mock";

describe("AlertCenter integration", () => {
  it("renders prioritized alerts from the deterministic snapshot", () => {
    const snapshot = createMockAlertCenterSnapshot();

    render(<AlertCenter snapshot={snapshot} />);

    expect(screen.getByText("Guest complaint awaiting response")).toBeInTheDocument();
    expect(screen.getByText("Meta campaign ROAS below target")).toBeInTheDocument();
    expect(screen.getByText(/active · 7 total/)).toBeInTheDocument();
  });

  it("filters alerts by severity", async () => {
    const user = userEvent.setup();
    const snapshot = createMockAlertCenterSnapshot();

    render(<AlertCenter snapshot={snapshot} />);

    await user.selectOptions(screen.getByLabelText("Filter by severity"), "critical");

    expect(screen.getByText("Guest complaint awaiting response")).toBeInTheDocument();
    expect(screen.queryByText("Meta campaign ROAS below target")).not.toBeInTheDocument();
  });

  it("shows the empty state when filters exclude all alerts", async () => {
    const user = userEvent.setup();
    const snapshot = createMockAlertCenterSnapshot();

    render(<AlertCenter snapshot={snapshot} />);

    await user.type(screen.getByLabelText("Search alerts"), "does-not-exist");

    expect(screen.getByText("No alerts match your filters")).toBeInTheDocument();
  });
});
