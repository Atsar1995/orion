"use client";

import Link from "next/link";
import { RecommendationPanel } from "@/components/command-center/RecommendationPanel";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ORION_SECONDARY_LINK_CLASS, WORKSPACE_BODY_MUTED_CLASS } from "@/lib/constants";
import type { DashboardSnapshot } from "@/types/intelligence";

type DecisionCenterProps = {
  snapshot: DashboardSnapshot;
};

/** Decision Center — ranked recommendations with executive action controls. */
export function DecisionCenter({ snapshot }: DecisionCenterProps) {
  return (
    <Card
      title="Decision Center"
      action={
        <Link href="/brief" className={ORION_SECONDARY_LINK_CLASS}>
          Morning Brief →
        </Link>
      }
    >
      <p className={`mb-4 ${WORKSPACE_BODY_MUTED_CLASS}`}>
        Top recommendations requiring judgment — act, delegate, or defer.
      </p>

      {snapshot.recommendations.length > 0 ? (
        <RecommendationPanel snapshot={snapshot} />
      ) : (
        <p className={WORKSPACE_BODY_MUTED_CLASS}>No recommendations at this time.</p>
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
