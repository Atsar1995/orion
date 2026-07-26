import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { WORKSPACE_PAGE_CLASS } from "@/lib/constants";

/** EP-001 platform not-found surface. */
export default function PlatformNotFound() {
  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <EmptyState
        title="Executive page not found"
        description="This ORION executive route does not exist or has not been enabled yet."
        action={
          <Link
            href="/"
            className="inline-flex items-center rounded-orion-md border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/85 hover:border-orion-gold/25 hover:bg-white/[0.06]"
          >
            Return to platform home
          </Link>
        }
      />
    </div>
  );
}
