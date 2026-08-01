import { Card } from "@/components/ui/Card";
import { ExecutiveProfileCard } from "@/components/organization/ExecutiveProfileCard";
import { UserManagementTable } from "@/components/organization/UserManagementTable";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { userManagementService } from "@/lib/platform/organization";
import {
  WORKSPACE_PAGE_CLASS,
  WORKSPACE_SECTION_CLASS,
  WORKSPACE_TITLE_CLASS,
  WORKSPACE_SUBTITLE_CLASS,
  WORKSPACE_GRID_2_COL,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

/** User management workspace (Mission P-005). */
export default async function UsersPage() {
  const { context } = await getDecisionServiceContext();
  const users = userManagementService.listUsers(context);
  const executive = users.find((user) => user.role === "executive");
  const executiveProfile = executive
    ? userManagementService.getExecutiveProfile(executive.id, context)
    : null;

  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <header className="space-y-2 border-b border-white/[0.06] pb-5">
        <h1 className={WORKSPACE_TITLE_CLASS}>Users</h1>
        <p className={WORKSPACE_SUBTITLE_CLASS}>
          Invite, manage, and attribute every action to a verified identity.
        </p>
      </header>

      <section className={WORKSPACE_SECTION_CLASS} aria-label="User management">
        {executive ? (
          <div className={WORKSPACE_GRID_2_COL}>
            <ExecutiveProfileCard user={executive} profile={executiveProfile} />
          </div>
        ) : null}

        <Card title="Organization Users" subtitle={`${users.length} user(s) in this organization`}>
          <UserManagementTable users={users} />
        </Card>
      </section>
    </div>
  );
}
