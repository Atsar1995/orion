import type { ReactNode } from "react";
import type { DashboardSectionConfig, DashboardWidgetPlacement } from "@/lib/dashboard/DashboardLayoutConfig";
import { DEFAULT_DASHBOARD_LAYOUT } from "@/lib/dashboard/DashboardLayoutConfig";
import type { DashboardState } from "@/lib/dashboard/DashboardState";
import {
  DashboardWidgetRegistry,
  defaultDashboardWidgetRegistry,
} from "@/lib/dashboard/WidgetRegistry";
import { createMockDashboardState } from "@/lib/dashboard/mock";

/** Composed widget ready for layout rendering. */
export type ComposedDashboardWidget = {
  readonly id: DashboardWidgetPlacement["id"];
  readonly span: NonNullable<DashboardWidgetPlacement["span"]>;
  readonly variant: NonNullable<DashboardWidgetPlacement["variant"]>;
  readonly node: ReactNode;
};

/** Composed dashboard section with rendered widgets. */
export type ComposedDashboardSection = {
  readonly id: string;
  readonly title?: string;
  readonly subtitle?: string;
  readonly columns: NonNullable<DashboardSectionConfig["columns"]>;
  readonly widgets: readonly ComposedDashboardWidget[];
};

/** Full composed dashboard output for EP-002 page rendering. */
export type DashboardComposition = {
  readonly state: DashboardState;
  readonly sections: readonly ComposedDashboardSection[];
};

type ComposeDashboardOptions = {
  readonly layout?: readonly DashboardSectionConfig[];
  readonly state?: DashboardState;
  readonly registry?: DashboardWidgetRegistry;
};

/** Configuration-driven dashboard composition — presentation only. */
export function composeDashboard(options: ComposeDashboardOptions = {}): DashboardComposition {
  const layout = options.layout ?? DEFAULT_DASHBOARD_LAYOUT;
  const state = options.state ?? createMockDashboardState();
  const registry = options.registry ?? defaultDashboardWidgetRegistry;

  return {
    state,
    sections: layout.map((section) => composeDashboardSection(section, state, registry)),
  };
}

function composeDashboardSection(
  section: DashboardSectionConfig,
  state: DashboardState,
  registry: DashboardWidgetRegistry,
): ComposedDashboardSection {
  const widgets = [...section.widgets]
    .sort((left, right) => left.order - right.order)
    .map((placement) => ({
      id: placement.id,
      span: placement.span ?? "full",
      variant: placement.variant ?? "default",
      node: registry.render(placement.id, state),
    }));

  return {
    id: section.id,
    title: section.title,
    subtitle: section.subtitle,
    columns: section.columns ?? 1,
    widgets,
  };
}
