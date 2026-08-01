import Link from "next/link";
import { Card } from "@/components/ui/Card";
import {
  WORKSPACE_PAGE_CLASS,
  WORKSPACE_SUBTITLE_CLASS,
  WORKSPACE_TITLE_CLASS,
} from "@/lib/constants";

export default function ForbiddenPage() {
  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <header className="space-y-2">
        <h1 className={WORKSPACE_TITLE_CLASS}>Access denied</h1>
        <p className={WORKSPACE_SUBTITLE_CLASS}>
          Your account does not have permission to view this workspace area.
        </p>
      </header>

      <Card title="Insufficient permissions">
        <div className="space-y-4">
          <p className="text-sm font-light text-white/60">
            Contact your organization administrator if you believe this is an error.
          </p>
          <Link
            href="/brief"
            className="inline-flex w-fit items-center gap-2 rounded-orion-md bg-orion-gold px-5 py-2.5 text-sm font-medium text-orion-navy transition-all duration-[var(--orion-duration-normal)] hover:bg-orion-gold-light"
          >
            Return to Morning Brief
          </Link>
        </div>
      </Card>
    </div>
  );
}
