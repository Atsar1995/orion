import { BriefSection } from "@/components/executive/BriefSection";
import { WORKSPACE_BODY_MUTED_CLASS } from "@/lib/constants";
import type { HospitalityBriefContribution } from "@/lib/hospitality/models/dashboard";

type HospitalityHealthBriefSectionProps = {
  health: HospitalityBriefContribution;
};

/** Brief section for hospitality occupancy, revenue, and operational signals (Mission P-007). */
export function HospitalityHealthBriefSection({ health }: HospitalityHealthBriefSectionProps) {
  return (
    <BriefSection
      id="brief-hospitality-health"
      title="Hospitality Operations"
      subtitle={`${health.workspaceLabel} — ${health.healthScore}/100`}
    >
      <p className="text-sm font-light text-orion-text/85">{health.briefingLine}</p>
      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <dt className={WORKSPACE_BODY_MUTED_CLASS}>Occupancy today</dt>
          <dd className="text-lg font-medium text-orion-text">{health.occupancyToday}</dd>
        </div>
        <div>
          <dt className={WORKSPACE_BODY_MUTED_CLASS}>Revenue today</dt>
          <dd className="text-lg font-medium text-orion-text">{health.revenueToday}</dd>
        </div>
        <div>
          <dt className={WORKSPACE_BODY_MUTED_CLASS}>VIP arrivals</dt>
          <dd className="text-lg font-medium text-orion-text">{health.vipArrivals}</dd>
        </div>
        {health.totalProperties !== undefined ? (
          <>
            <div>
              <dt className={WORKSPACE_BODY_MUTED_CLASS}>Properties</dt>
              <dd className="text-lg font-medium text-orion-text">{health.totalProperties}</dd>
            </div>
            <div>
              <dt className={WORKSPACE_BODY_MUTED_CLASS}>Inventory health</dt>
              <dd className="text-lg font-medium text-orion-text">{health.inventoryHealthScore}/100</dd>
            </div>
            <div>
              <dt className={WORKSPACE_BODY_MUTED_CLASS}>Unavailable units</dt>
              <dd className="text-lg font-medium text-orion-text">{health.unavailableInventory}</dd>
            </div>
          </>
        ) : null}
      </dl>
      {health.criticalIssues.length > 0 ? (
        <ul className="mt-4 space-y-1" aria-label="Critical hospitality issues">
          {health.criticalIssues.map((issue) => (
            <li key={issue} className="text-xs text-orion-gold/85">
              {issue}
            </li>
          ))}
        </ul>
      ) : null}
    </BriefSection>
  );
}
