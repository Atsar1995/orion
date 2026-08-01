import { BriefSection } from "@/components/executive/BriefSection";
import type { BriefBusinessHealth } from "@/types/executive";
import { BusinessHealthCard } from "@/components/executive/BusinessHealthCard";

type BriefBusinessHealthSectionProps = {
  health: BriefBusinessHealth;
};

/** Business health with major risks and opportunities (Mission P-002). */
export function BriefBusinessHealthSection({ health }: BriefBusinessHealthSectionProps) {
  return (
    <div className="space-y-4">
      <BusinessHealthCard health={health} />
      {(health.majorRisks.length > 0 || health.majorOpportunities.length > 0) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {health.majorRisks.length > 0 ? (
            <BriefSection title="Major Risks" subtitle="Items requiring executive attention">
              <ul className="space-y-2">
                {health.majorRisks.map((risk) => (
                  <li
                    key={risk.id}
                    className="rounded-orion-md border border-red-400/20 bg-red-400/[0.04] px-3 py-2 text-sm font-light text-orion-text/85"
                  >
                    <span className="font-medium">{risk.label}</span>
                    <span className="mt-1 block text-xs text-orion-muted">{risk.summary}</span>
                  </li>
                ))}
              </ul>
            </BriefSection>
          ) : null}
          {health.majorOpportunities.length > 0 ? (
            <BriefSection title="Major Opportunities" subtitle="High-value growth signals">
              <ul className="space-y-2">
                {health.majorOpportunities.map((opportunity) => (
                  <li
                    key={opportunity.id}
                    className="rounded-orion-md border border-orion-gold/20 bg-orion-gold/[0.04] px-3 py-2 text-sm font-light text-orion-text/85"
                  >
                    <span className="font-medium">{opportunity.label}</span>
                    <span className="mt-1 block text-xs text-orion-muted">{opportunity.summary}</span>
                  </li>
                ))}
              </ul>
            </BriefSection>
          ) : null}
        </div>
      )}
    </div>
  );
}
