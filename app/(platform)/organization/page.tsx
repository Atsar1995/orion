import { Card } from "@/components/ui/Card";
import { OrgHierarchyTree } from "@/components/organization/OrgHierarchyTree";
import { OrganizationHealthPanel } from "@/components/organization/OrganizationHealthPanel";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import {
  delegationService,
  hierarchyService,
  organizationService,
  userManagementService,
} from "@/lib/platform/organization";
import {
  WORKSPACE_PAGE_CLASS,
  WORKSPACE_SECTION_CLASS,
  WORKSPACE_TITLE_CLASS,
  WORKSPACE_SUBTITLE_CLASS,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

/** Organization management workspace (Mission P-005). */
export default async function OrganizationPage() {
  const { context } = await getDecisionServiceContext();
  const organizations = organizationService.list(context);
  const structure = organizationService.getStructure(context);
  const hierarchy = hierarchyService.buildTree(context);
  const health = userManagementService.getOrganizationHealth(context);
  const delegations = delegationService.list(context);

  if (organizations.length === 0) {
    return (
      <div className={WORKSPACE_PAGE_CLASS}>
        <header className="space-y-2 border-b border-white/[0.06] pb-5">
          <h1 className={WORKSPACE_TITLE_CLASS}>Organization</h1>
          <p className={WORKSPACE_SUBTITLE_CLASS} role="status">
            No organizations configured. Create your first organization to establish identity and access control.
          </p>
        </header>
      </div>
    );
  }

  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <header className="space-y-2 border-b border-white/[0.06] pb-5">
        <h1 className={WORKSPACE_TITLE_CLASS}>Organization</h1>
        <p className={WORKSPACE_SUBTITLE_CLASS}>
          Structure, hierarchy, and organizational health for {structure.organization?.name ?? "your organization"}.
        </p>
      </header>

      <section className={WORKSPACE_SECTION_CLASS} aria-label="Organization overview">
        <OrganizationHealthPanel health={health} />

        <Card title="Organizational Hierarchy" subtitle="Business units, departments, teams, and users">
          {structure.departments.length === 0 ? (
            <p className="text-sm font-light text-orion-muted" role="status">
              No departments configured yet.
            </p>
          ) : (
            <OrgHierarchyTree node={hierarchy} />
          )}
        </Card>

        <Card title="Active Delegations">
          {delegations.length === 0 ? (
            <p className="text-sm font-light text-orion-muted" role="status">
              No active delegations.
            </p>
          ) : (
            <ul className="space-y-2">
              {delegations.map((delegation) => (
                <li
                  key={delegation.id}
                  className="rounded-orion-md border border-orion-border/50 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-orion-text">{delegation.label}</span>
                  <span className="mx-2 text-orion-muted">·</span>
                  <span className="text-orion-muted capitalize">{delegation.scope}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}
