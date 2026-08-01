import type { IntelligenceFeedItem } from "@/types/intelligence-integration";
import { BriefSection } from "@/components/executive/BriefSection";
import { WORKSPACE_BODY_MUTED_CLASS } from "@/lib/constants";

type IntelligenceFeedSectionProps = {
  items: readonly IntelligenceFeedItem[];
};

/** Real-time intelligence feed for the Executive Brief (Mission P-006). */
export function IntelligenceFeedSection({ items }: IntelligenceFeedSectionProps) {
  return (
    <BriefSection
      id="brief-intelligence-feed"
      title="Intelligence Feed"
      subtitle="Recent platform events routed through the Intelligence Integration Layer"
    >
      {items.length === 0 ? (
        <p className={WORKSPACE_BODY_MUTED_CLASS} role="status">
          No intelligence events available yet.
        </p>
      ) : (
        <ul className="space-y-2" aria-label="Intelligence event feed">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-orion-md border border-orion-border/50 px-3 py-2 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-orion-text">{item.summary}</span>
                <span className="text-[10px] tracking-wide text-orion-gold/70 uppercase">
                  {item.priority}
                </span>
              </div>
              <p className={`mt-1 ${WORKSPACE_BODY_MUTED_CLASS}`}>
                {item.sourceWorkspace} · {item.sourceService} ·{" "}
                {new Date(item.timestamp).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </BriefSection>
  );
}
