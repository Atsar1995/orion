import type { OrganizationHealthSnapshot } from "@/types/organization";
import { BriefSection } from "@/components/executive/BriefSection";
import { WORKSPACE_BODY_MUTED_CLASS } from "@/lib/constants";

type OrganizationHealthBriefSectionProps = {
  health: OrganizationHealthSnapshot;
};

/** Brief section for organizational health and leadership (Mission P-005). */
export function OrganizationHealthBriefSection({ health }: OrganizationHealthBriefSectionProps) {
  return (
    <BriefSection
      id="brief-organization-health"
      title="Organizational Health"
      subtitle={`${health.organizationName} — ${health.healthScore}/100`}
    >
      <p className="text-sm font-light text-orion-text/85">{health.summary}</p>
      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <dt className={WORKSPACE_BODY_MUTED_CLASS}>Active users</dt>
          <dd className="text-lg font-medium text-orion-text">
            {health.activeUsers}/{health.totalUsers}
          </dd>
        </div>
        <div>
          <dt className={WORKSPACE_BODY_MUTED_CLASS}>Delegations</dt>
          <dd className="text-lg font-medium text-orion-text">{health.activeDelegations}</dd>
        </div>
        <div>
          <dt className={WORKSPACE_BODY_MUTED_CLASS}>Vacant roles</dt>
          <dd className="text-lg font-medium text-orion-text">{health.vacantCriticalRoles.length}</dd>
        </div>
      </dl>
      {health.vacantCriticalRoles.length > 0 ? (
        <ul className="mt-4 space-y-1" aria-label="Vacant critical roles">
          {health.vacantCriticalRoles.map((role) => (
            <li key={role} className="text-xs text-orion-gold/85">
              {role}
            </li>
          ))}
        </ul>
      ) : null}
    </BriefSection>
  );
}
