import type { PlatformUser } from "@/types/organization";
import { getRoleLabel } from "@/lib/auth/roles";
import { WORKSPACE_CAPTION_CLASS, WORKSPACE_BODY_MUTED_CLASS } from "@/lib/constants";

type UserManagementTableProps = {
  users: readonly PlatformUser[];
};

/** User management table with keyboard-accessible rows (Mission P-005). */
export function UserManagementTable({ users }: UserManagementTableProps) {
  if (users.length === 0) {
    return (
      <p className={WORKSPACE_BODY_MUTED_CLASS} role="status">
        No users in this organization yet. Invite your first team member to get started.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto" role="region" aria-label="Organization users">
      <table className="min-w-full text-left text-sm">
        <caption className="sr-only">Organization users</caption>
        <thead>
          <tr className="border-b border-orion-border/60">
            <th scope="col" className={`px-3 py-2 ${WORKSPACE_CAPTION_CLASS}`}>
              Name
            </th>
            <th scope="col" className={`px-3 py-2 ${WORKSPACE_CAPTION_CLASS}`}>
              Email
            </th>
            <th scope="col" className={`px-3 py-2 ${WORKSPACE_CAPTION_CLASS}`}>
              Role
            </th>
            <th scope="col" className={`px-3 py-2 ${WORKSPACE_CAPTION_CLASS}`}>
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-orion-border/30">
              <th scope="row" className="px-3 py-2 font-medium text-orion-text">
                {user.name}
              </th>
              <td className="px-3 py-2 text-orion-muted">{user.email}</td>
              <td className="px-3 py-2 text-orion-text">{getRoleLabel(user.role)}</td>
              <td className="px-3 py-2 capitalize text-orion-muted">{user.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
