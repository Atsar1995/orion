import Link from "next/link";
import { BriefSection } from "@/components/executive/BriefSection";
import { ConfidenceIndicator } from "@/components/executive/ConfidenceIndicator";
import { EvidenceList } from "@/components/executive/EvidenceList";
import { EmptyState } from "@/components/ui/EmptyState";
import { WORKSPACE_LIST_CLASS } from "@/lib/constants";
import type { BriefPriorityDecision } from "@/types/executive";

type BriefPrioritiesSectionProps = {
  priorities: readonly BriefPriorityDecision[];
};

/** Today's highest-priority executive decisions (Mission P-002). */
export function BriefPrioritiesSection({ priorities }: BriefPrioritiesSectionProps) {
  const visible = priorities.slice(0, 5);

  return (
    <BriefSection
      title="Today's Priorities"
      subtitle="Highest priority executive decisions requiring attention"
    >
      {visible.length > 0 ? (
        <ol className={WORKSPACE_LIST_CLASS}>
          {visible.map((priority) => (
            <li
              key={priority.id}
              className="rounded-orion-md border border-orion-border/70 bg-orion-surface/40 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-orion-gold/25 bg-orion-gold/10 text-[10px] font-medium text-orion-gold">
                      {priority.rank}
                    </span>
                    <p className="text-sm font-medium text-orion-text">
                      {priority.href ? (
                        <Link href={priority.href} className="hover:text-orion-gold">
                          {priority.title}
                        </Link>
                      ) : (
                        priority.title
                      )}
                    </p>
                  </div>
                  <p className="mt-2 text-xs font-light text-orion-muted">
                    Priority {priority.priority} · {priority.businessImpact}
                  </p>
                  <p className="mt-1 text-xs font-light text-orion-text/80">
                    Recommended: {priority.recommendedAction}
                  </p>
                </div>
                <ConfidenceIndicator confidence={priority.confidence} />
              </div>
              {priority.evidence.length > 0 ? (
                <div className="mt-3 border-t border-orion-border/60 pt-3">
                  <EvidenceList evidence={priority.evidence} compact />
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState
          title="No priorities queued"
          description="ORION will surface ranked priorities when new signals arrive."
        />
      )}
    </BriefSection>
  );
}
