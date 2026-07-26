import { describe, expect, it } from "vitest";
import {
  Widget,
  WidgetBody,
  WidgetFooter,
  WidgetGrid,
  WidgetHeader,
  WidgetRegistry,
} from "@/components/dashboard";
import { render, screen } from "@testing-library/react";

describe("WidgetRegistry", () => {
  it("registers and lists widget definitions in order", () => {
    const registry = new WidgetRegistry();
    registry.register({ id: "health", title: "Business Health", order: 2 });
    registry.register({ id: "alerts", title: "Critical Alerts", order: 1 });

    expect(registry.list().map((widget) => widget.id)).toEqual(["alerts", "health"]);
  });
});

describe("Widget components", () => {
  it("renders widget shell regions", () => {
    render(
      <Widget>
        <WidgetHeader title="Business Health" description="Overall condition" />
        <WidgetBody>Score content</WidgetBody>
        <WidgetFooter>Updated just now</WidgetFooter>
      </Widget>,
    );

    expect(screen.getByText("Business Health")).toBeInTheDocument();
    expect(screen.getByText("Score content")).toBeInTheDocument();
    expect(screen.getByText("Updated just now")).toBeInTheDocument();
  });

  it("renders widget grid layout", () => {
    const { container } = render(
      <WidgetGrid columns={2}>
        <div>One</div>
        <div>Two</div>
      </WidgetGrid>,
    );

    expect(container.firstChild).toHaveClass("grid");
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
  });
});
