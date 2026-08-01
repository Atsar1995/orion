import { Card } from "@/components/ui/Card";
import {
  WORKSPACE_PAGE_CLASS,
  WORKSPACE_SUBTITLE_CLASS,
} from "@/lib/constants";
import { ProfileWorkspaceHeader } from "@/components/profile/ProfileWorkspaceHeader";
import { getServerSession } from "@/lib/identity/server-session";

export default async function ProfileSecurityPage() {
  const { session } = await getServerSession();

  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <ProfileWorkspaceHeader
        title="Security"
        subtitle="Session and account security for your ORION identity."
      />

      <Card title="Active session">
        <div className="space-y-3 text-sm font-light text-white/70">
          <p>Signed in as {session?.user.email ?? "—"}.</p>
          <p>
            Session expires at{" "}
            {session?.expiresAt.toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            }) ?? "—"}
            .
          </p>
          <p>Sessions automatically expire after eight hours of inactivity.</p>
        </div>
      </Card>

      <Card title="Password & SSO">
        <p className="text-sm font-light text-white/60">
          Password change and single sign-on providers are not yet enabled. Use your
          demo credentials in alpha environments.
        </p>
      </Card>

      <p className={WORKSPACE_SUBTITLE_CLASS}>
        Audit events for sign-in, sign-out, and session expiry are recorded for future
        persistence.
      </p>
    </div>
  );
}
