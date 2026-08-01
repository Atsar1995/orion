import { Card } from "@/components/ui/Card";
import {
  WORKSPACE_FIELD_LIST_CLASS,
  WORKSPACE_FIELD_ROW_CLASS,
  WORKSPACE_PAGE_CLASS,
  WORKSPACE_SUBTITLE_CLASS,
} from "@/lib/constants";
import { ProfileWorkspaceHeader } from "@/components/profile/ProfileWorkspaceHeader";
import { getServerSession } from "@/lib/identity/server-session";

export default async function ProfilePreferencesPage() {
  const { profile } = await getServerSession();
  const organization = profile?.organization;

  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <ProfileWorkspaceHeader
        title="Preferences"
        subtitle="Organization defaults applied to your executive workspace."
      />

      <Card title="Regional settings">
        <dl className={WORKSPACE_FIELD_LIST_CLASS}>
          <div className={WORKSPACE_FIELD_ROW_CLASS}>
            <dt className="text-sm text-orion-muted">Time zone</dt>
            <dd className="text-sm text-orion-text">{organization?.timeZone ?? "—"}</dd>
          </div>
          <div className={WORKSPACE_FIELD_ROW_CLASS}>
            <dt className="text-sm text-orion-muted">Locale</dt>
            <dd className="text-sm text-orion-text">{organization?.locale ?? "—"}</dd>
          </div>
          <div className={WORKSPACE_FIELD_ROW_CLASS}>
            <dt className="text-sm text-orion-muted">Date format</dt>
            <dd className="text-sm text-orion-text">
              {organization?.defaultSettings.dateFormat ?? "—"}
            </dd>
          </div>
          <div className={WORKSPACE_FIELD_ROW_CLASS}>
            <dt className="text-sm text-orion-muted">Default landing</dt>
            <dd className="text-sm text-orion-text">
              {organization?.defaultSettings.executiveLanding ?? "/brief"}
            </dd>
          </div>
        </dl>
      </Card>

      <p className={WORKSPACE_SUBTITLE_CLASS}>
        Personal preference overrides will be available in a future release.
      </p>
    </div>
  );
}
