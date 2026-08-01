import type { OrganizationHealthSnapshot } from "@/types/organization";
import { Card } from "@/components/ui/Card";
import { WORKSPACE_BODY_MUTED_CLASS } from "@/lib/constants";

type OrganizationHealthPanelProps = {
  health: OrganizationHealthSnapshot;
};

/** Organization health, leadership, and vacant roles (Mission P-005). */
export function OrganizationHealthPanel({ health }: OrganizationHealthPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card title="Organizational Health" subtitle={health.summary}>
        <p className="text-3xl font-semibold text-orion-text">{health.healthScore}/100</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className={WORKSPACE_BODY_MUTED_CLASS}>Active users</dt>
            <dd className="text-orion-text">
              {health.activeUsers}/{health.totalUsers}
            </dd>
          </div>
          <div>
            <dt className={WORKSPACE_BODY_MUTED_CLASS}>Active delegations</dt>
            <dd className="text-orion-text">{health.activeDelegations}</dd>
          </div>
        </dl>
      </Card>

      <Card title="Leadership Structure">
        {health.leadershipStructure.length === 0 ? (
          <p className={WORKSPACE_BODY_MUTED_CLASS} role="status">
            No leadership roles assigned.
          </p>
        ) : (
          <ul className="space-y-2">
            {health.leadershipStructure.map((leader) => (
              <li key={leader.name} className="flex justify-between gap-4 text-sm">
                <span className="font-medium text-orion-text">{leader.name}</span>
                <span className={WORKSPACE_BODY_MUTED_CLASS}>{leader.title}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {health.vacantCriticalRoles.length > 0 ? (
        <Card title="Vacant Critical Roles" className="lg:col-span-2">
          <ul className="space-y-2" role="list">
            {health.vacantCriticalRoles.map((role) => (
              <li key={role} className="text-sm text-orion-gold/90">
                {role}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
