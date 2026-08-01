import Link from "next/link";
import { BriefSection } from "@/components/executive/BriefSection";
import type { ExecutiveDecisionsSummary } from "@/types/executive";

type ExecutiveDecisionsSectionProps = {
  decisions: ExecutiveDecisionsSummary;
};

function DecisionBucket({
  title,
  items,
}: {
  title: string;
  items: ExecutiveDecisionsSummary["pending"];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="mb-2 text-[10px] font-medium tracking-wide text-orion-muted uppercase">
        {title}
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="block rounded-orion-md border border-orion-border/60 px-3 py-2 text-sm font-light text-orion-text/85 transition-colors hover:border-orion-gold/25 hover:text-orion-gold"
            >
              <span className="font-medium">{item.title}</span>
              <span className="mt-1 block text-xs text-orion-muted">
                {item.status}
                {item.delegatedTo ? ` · Delegated to ${item.delegatedTo}` : ""}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Executive decisions linked to EDI (Mission P-002). */
export function ExecutiveDecisionsSection({ decisions }: ExecutiveDecisionsSectionProps) {
  const hasAny =
    decisions.pending.length > 0 ||
    decisions.delegated.length > 0 ||
    decisions.awaitingReview.length > 0 ||
    decisions.recentlyCompleted.length > 0;

  return (
    <BriefSection
      id="brief-decisions"
      title="Executive Decisions"
      subtitle="Pending, delegated, awaiting review, and recently completed"
    >
      {hasAny ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DecisionBucket title="Pending" items={decisions.pending} />
          <DecisionBucket title="Delegated" items={decisions.delegated} />
          <DecisionBucket title="Awaiting Review" items={decisions.awaitingReview} />
          <DecisionBucket title="Recently Completed" items={decisions.recentlyCompleted} />
        </div>
      ) : (
        <p className="text-sm font-light text-orion-muted">
          No executive decisions yet. Actions on recommendations will appear here.
        </p>
      )}
      <Link
        href="/decisions"
        className="mt-4 inline-block text-xs font-medium text-orion-gold/80 hover:text-orion-gold"
      >
        Open Executive Decision Intelligence →
      </Link>
    </BriefSection>
  );
}
