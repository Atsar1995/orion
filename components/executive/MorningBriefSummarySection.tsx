import { BriefSection } from "@/components/executive/BriefSection";
import type { MorningBriefSummary } from "@/types/executive";

type MorningBriefSummarySectionProps = {
  summary: MorningBriefSummary;
};

/** Morning Brief synthesis — today's executive orientation (Mission P-002). */
export function MorningBriefSummarySection({ summary }: MorningBriefSummarySectionProps) {
  return (
    <BriefSection
      id="brief-morning-summary"
      title="Morning Brief"
      subtitle="Today's summary, critical decisions, and priority actions"
    >
      <div className="space-y-4 rounded-orion-lg border border-orion-gold/15 bg-orion-gold/[0.04] p-4">
        <div>
          <p className="text-[10px] font-medium tracking-wide text-orion-muted uppercase">
            Today&apos;s Summary
          </p>
          <p className="mt-2 text-sm font-light leading-relaxed text-orion-text/90">
            {summary.todaySummary}
          </p>
        </div>

        {summary.criticalDecisions.length > 0 ? (
          <div>
            <p className="text-[10px] font-medium tracking-wide text-orion-muted uppercase">
              Critical Decisions
            </p>
            <ul className="mt-2 space-y-1 text-sm font-light text-orion-text/85">
              {summary.criticalDecisions.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {summary.priorityActions.length > 0 ? (
          <div>
            <p className="text-[10px] font-medium tracking-wide text-orion-muted uppercase">
              Priority Actions
            </p>
            <ul className="mt-2 space-y-1 text-sm font-light text-orion-text/85">
              {summary.priorityActions.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {summary.executiveNotes.length > 0 ? (
          <div>
            <p className="text-[10px] font-medium tracking-wide text-orion-muted uppercase">
              Executive Notes
            </p>
            <ul className="mt-2 space-y-1 text-sm font-light text-orion-muted">
              {summary.executiveNotes.map((note) => (
                <li key={note}>· {note}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </BriefSection>
  );
}
