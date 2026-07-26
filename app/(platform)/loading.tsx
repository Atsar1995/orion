import { WORKSPACE_PAGE_CLASS } from "@/lib/constants";

/** EP-001 platform route loading state. */
export default function PlatformLoading() {
  return (
    <div className={WORKSPACE_PAGE_CLASS} aria-busy="true" aria-live="polite">
      <div className="space-y-4">
        <div className="h-10 w-64 animate-pulse rounded-orion-md bg-white/[0.06]" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded-orion-md bg-white/[0.04]" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="h-28 animate-pulse rounded-orion-lg bg-white/[0.04]" />
          <div className="h-28 animate-pulse rounded-orion-lg bg-white/[0.04]" />
          <div className="h-28 animate-pulse rounded-orion-lg bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}
