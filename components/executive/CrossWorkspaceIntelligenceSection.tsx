import Link from "next/link";
import { BriefSection } from "@/components/executive/BriefSection";
import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import type { CrossWorkspaceSignal } from "@/types/executive";

type CrossWorkspaceIntelligenceSectionProps = {
  signals: readonly CrossWorkspaceSignal[];
};

const STATUS_LABELS: Record<CrossWorkspaceSignal["status"], string> = {
  live: "Live",
  partial: "Partial",
  pending: "Pending",
};

/** Cross-workspace intelligence aggregation (Mission P-002). */
export function CrossWorkspaceIntelligenceSection({
  signals,
}: CrossWorkspaceIntelligenceSectionProps) {
  return (
    <BriefSection
      id="brief-workspaces"
      title="Cross-Workspace Intelligence"
      subtitle="Signals from every workspace — available sources shown gracefully"
    >
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {signals.map((signal) => (
          <li
            key={signal.workspaceId}
            className="rounded-orion-md border border-orion-border/70 bg-orion-surface/30 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-orion-text">{signal.label}</p>
              <span className="text-[10px] font-medium tracking-wide text-orion-muted uppercase">
                {STATUS_LABELS[signal.status]}
              </span>
            </div>
            <p className="mt-2 text-xs font-light leading-relaxed text-orion-muted">
              {signal.summary}
            </p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <StatusIndicator
                status={
                  signal.status === "live"
                    ? "healthy"
                    : signal.status === "partial"
                      ? "attention"
                      : "attention"
                }
                showLabel={false}
              />
              {signal.href ? (
                <Link
                  href={signal.href}
                  className="text-[11px] font-medium text-orion-gold/80 hover:text-orion-gold"
                >
                  Open workspace →
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </BriefSection>
  );
}
