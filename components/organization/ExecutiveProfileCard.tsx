import type { ExecutiveProfile, PlatformUser } from "@/types/organization";
import { Card } from "@/components/ui/Card";
import { WORKSPACE_BODY_MUTED_CLASS } from "@/lib/constants";

type ExecutiveProfileCardProps = {
  user: PlatformUser;
  profile: ExecutiveProfile | null;
};

/** Executive profile summary card (Mission P-005). */
export function ExecutiveProfileCard({ user, profile }: ExecutiveProfileCardProps) {
  return (
    <Card title={user.name} subtitle={profile?.title ?? user.role.replaceAll("_", " ")}>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className={WORKSPACE_BODY_MUTED_CLASS}>Email</dt>
          <dd className="text-orion-text">{user.email}</dd>
        </div>
        {profile ? (
          <>
            <div className="flex justify-between gap-4">
              <dt className={WORKSPACE_BODY_MUTED_CLASS}>Operating mode</dt>
              <dd className="text-orion-text capitalize">{profile.operatingMode}</dd>
            </div>
            <div>
              <dt className={WORKSPACE_BODY_MUTED_CLASS}>Focus areas</dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {profile.focusAreas.map((area) => (
                  <span
                    key={area}
                    className="rounded-orion-sm border border-orion-border/50 px-2 py-0.5 text-xs text-orion-text"
                  >
                    {area}
                  </span>
                ))}
              </dd>
            </div>
            {profile.bio ? (
              <div>
                <dt className={WORKSPACE_BODY_MUTED_CLASS}>Bio</dt>
                <dd className="mt-1 text-orion-text/85">{profile.bio}</dd>
              </div>
            ) : null}
          </>
        ) : (
          <p className={WORKSPACE_BODY_MUTED_CLASS}>No executive profile configured.</p>
        )}
      </dl>
    </Card>
  );
}
