import { Card } from "@/components/ui/Card";
import { getRoleLabel } from "@/lib/auth/roles";
import { getDisplayInitials } from "@/lib/identity/user-display";
import {
  WORKSPACE_FIELD_LIST_CLASS,
  WORKSPACE_FIELD_ROW_CLASS,
  WORKSPACE_PAGE_CLASS,
  WORKSPACE_SUBTITLE_CLASS,
  WORKSPACE_TITLE_CLASS,
} from "@/lib/constants";
import { ProfileWorkspaceHeader } from "@/components/profile/ProfileWorkspaceHeader";
import { getServerSession } from "@/lib/identity/server-session";

export default async function ProfilePage() {
  const { session, profile } = await getServerSession();

  if (!session) {
    return null;
  }

  const organization = profile?.organization;

  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <ProfileWorkspaceHeader
        title="My Profile"
        subtitle="Your authenticated identity across ORION."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
        <Card title="Avatar">
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-orion-gold/25 bg-orion-gold/10 text-2xl font-medium text-orion-gold">
              {getDisplayInitials(session.user.name)}
            </div>
            <p className="text-sm text-orion-muted">Profile photo coming soon</p>
          </div>
        </Card>

        <Card title="Identity">
          <dl className={WORKSPACE_FIELD_LIST_CLASS}>
            <div className={WORKSPACE_FIELD_ROW_CLASS}>
              <dt className="text-sm text-orion-muted">Display name</dt>
              <dd className="text-sm text-orion-text">{session.user.name}</dd>
            </div>
            <div className={WORKSPACE_FIELD_ROW_CLASS}>
              <dt className="text-sm text-orion-muted">Email</dt>
              <dd className="text-sm text-orion-text">{session.user.email}</dd>
            </div>
            <div className={WORKSPACE_FIELD_ROW_CLASS}>
              <dt className="text-sm text-orion-muted">Role</dt>
              <dd className="text-sm text-orion-text">{getRoleLabel(session.user.role)}</dd>
            </div>
            <div className={WORKSPACE_FIELD_ROW_CLASS}>
              <dt className="text-sm text-orion-muted">Organization</dt>
              <dd className="text-sm text-orion-text">
                {organization?.branding.displayName ?? organization?.name ?? "—"}
              </dd>
            </div>
            <div className={WORKSPACE_FIELD_ROW_CLASS}>
              <dt className="text-sm text-orion-muted">Workspace</dt>
              <dd className="text-sm text-orion-text">{session.activeWorkspace.name}</dd>
            </div>
          </dl>
        </Card>
      </div>

      {organization ? (
        <Card title="Organization profile">
          <dl className={WORKSPACE_FIELD_LIST_CLASS}>
            <div className={WORKSPACE_FIELD_ROW_CLASS}>
              <dt className="text-sm text-orion-muted">Legal name</dt>
              <dd className="text-sm text-orion-text">{organization.name}</dd>
            </div>
            <div className={WORKSPACE_FIELD_ROW_CLASS}>
              <dt className="text-sm text-orion-muted">Time zone</dt>
              <dd className="text-sm text-orion-text">{organization.timeZone}</dd>
            </div>
            <div className={WORKSPACE_FIELD_ROW_CLASS}>
              <dt className="text-sm text-orion-muted">Locale</dt>
              <dd className="text-sm text-orion-text">{organization.locale}</dd>
            </div>
            <div className={WORKSPACE_FIELD_ROW_CLASS}>
              <dt className="text-sm text-orion-muted">Currency</dt>
              <dd className="text-sm text-orion-text">
                {organization.defaultSettings.currency}
              </dd>
            </div>
          </dl>
        </Card>
      ) : null}

      <p className={WORKSPACE_SUBTITLE_CLASS}>
        SSO and advanced profile editing will be available in a future release.
      </p>
    </div>
  );
}
