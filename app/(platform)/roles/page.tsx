import { Card } from "@/components/ui/Card";
import { PermissionMatrix } from "@/components/organization/PermissionMatrix";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { permissionService, roleService, userManagementService } from "@/lib/platform/organization";
import { getRoleLabel } from "@/lib/auth/roles";
import {
  WORKSPACE_PAGE_CLASS,
  WORKSPACE_SECTION_CLASS,
  WORKSPACE_TITLE_CLASS,
  WORKSPACE_SUBTITLE_CLASS,
  WORKSPACE_BODY_MUTED_CLASS,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

/** Role and permission management workspace (Mission P-005). */
export default async function RolesPage() {
  const { context } = await getDecisionServiceContext();
  const roles = roleService.listRoles();
  const matrix = permissionService.buildMatrix();
  const users = userManagementService.listUsers(context);

  const roleCounts = roles.map((role) => ({
    ...role,
    count: users.filter((user) => user.role === role.slug).length,
  }));

  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <header className="space-y-2 border-b border-white/[0.06] pb-5">
        <h1 className={WORKSPACE_TITLE_CLASS}>Roles & Permissions</h1>
        <p className={WORKSPACE_SUBTITLE_CLASS}>
          Role-based access control — assign roles and evaluate permissions across every workspace.
        </p>
      </header>

      <section className={WORKSPACE_SECTION_CLASS} aria-label="Role management">
        <Card title="Platform Roles">
          {roles.length === 0 ? (
            <p className={WORKSPACE_BODY_MUTED_CLASS} role="status">
              No roles assigned.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {roleCounts.map((role) => (
                <li
                  key={role.slug}
                  className="rounded-orion-md border border-orion-border/50 px-4 py-3"
                >
                  <p className="font-medium text-orion-text">{getRoleLabel(role.slug)}</p>
                  <p className={`mt-1 ${WORKSPACE_BODY_MUTED_CLASS}`}>
                    {role.count} user{role.count === 1 ? "" : "s"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Permission Matrix" subtitle="Read (R) and write (RW) access by role and module">
          <PermissionMatrix entries={matrix} />
        </Card>
      </section>
    </div>
  );
}
