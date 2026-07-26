import { createElement, type ReactNode } from "react";
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
import type { DashboardState, DashboardWidgetId } from "@/lib/dashboard/DashboardState";

export type DashboardWidgetRenderer = (state: DashboardState) => ReactNode;

/** Maps dashboard widget IDs to presentation components — no business logic. */
export class DashboardWidgetRegistry {
  private readonly renderers = new Map<DashboardWidgetId, DashboardWidgetRenderer>();

  register(id: DashboardWidgetId, renderer: DashboardWidgetRenderer): void {
    this.renderers.set(id, renderer);
  }

  render(id: DashboardWidgetId, state: DashboardState): ReactNode {
    const renderer = this.renderers.get(id);

    if (!renderer) {
      return null;
    }

    return renderer(state);
  }

  has(id: DashboardWidgetId): boolean {
    return this.renderers.has(id);
  }

  list(): readonly DashboardWidgetId[] {
    return [...this.renderers.keys()];
  }
}

/** Default EP-002 widget registry wired to presentation components. */
export function createDefaultDashboardWidgetRegistry(): DashboardWidgetRegistry {
  const registry = new DashboardWidgetRegistry();

  registry.register("business-health", (state) =>
    createElement(BusinessHealthWidget, { data: state.businessHealth }),
  );
  registry.register("confidence", (state) =>
    createElement(ConfidenceWidget, { data: state.confidence }),
  );
  registry.register("morning-brief", (state) =>
    createElement(MorningBriefWidget, { data: state.morningBrief }),
  );
  registry.register("alert-center", (state) =>
    createElement(AlertCenterWidget, { snapshot: state.alertCenter }),
  );
  registry.register("priorities", (state) =>
    createElement(PrioritiesWidget, { data: state.priorities }),
  );
  registry.register("kpi-highlights", (state) =>
    createElement(KPIHighlightsWidget, { data: state.kpis }),
  );
  registry.register("executive-narrative", (state) =>
    createElement(ExecutiveNarrativeWidget, { data: state.narrative }),
  );
  registry.register("recommendation-preview", (state) =>
    createElement(RecommendationPreviewWidget, { data: state.recommendations }),
  );

  return registry;
}

export const defaultDashboardWidgetRegistry = createDefaultDashboardWidgetRegistry();
