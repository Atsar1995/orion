"use client";

import { RecommendationPanel } from "@/components/command-center/RecommendationPanel";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { DashboardSnapshot } from "@/types/intelligence";

type DecisionCenterProps = {
  snapshot: DashboardSnapshot;
};

/** Decision Center — top recommendations with executive action controls (UI-only). */
export function DecisionCenter({ snapshot }: DecisionCenterProps) {
  return (
    <Card title="Decision Center">
      <p className="mb-4 text-sm font-light text-orion-muted">Top Recommendations</p>

      {snapshot.recommendations.length > 0 ? (
        <RecommendationPanel snapshot={snapshot} />
      ) : (
        <p className="text-sm font-light text-orion-muted">No recommendations at this time.</p>
      )}

      <div
        className="mt-6 flex flex-wrap gap-2 border-t border-orion-border pt-4"
        role="group"
        aria-label="Decision actions"
      >
        <Button type="button" aria-label="Approve selected recommendation">
          Approve
        </Button>
        <Button
          type="button"
          className="border border-white/[0.08] bg-white/[0.04] text-white/85 hover:border-orion-gold/25 hover:bg-white/[0.06]"
          aria-label="Delegate selected recommendation"
        >
          Delegate
        </Button>
        <Button
          type="button"
          className="border border-white/[0.08] bg-white/[0.04] text-white/85 hover:border-orion-gold/25 hover:bg-white/[0.06]"
          aria-label="Dismiss selected recommendation"
        >
          Dismiss
        </Button>
        <Button
          type="button"
          className="border border-white/[0.08] bg-white/[0.04] text-white/85 hover:border-orion-gold/25 hover:bg-white/[0.06]"
          aria-label="Mark recommendation complete"
        >
          Mark Complete
        </Button>
      </div>
    </Card>
  );
}
