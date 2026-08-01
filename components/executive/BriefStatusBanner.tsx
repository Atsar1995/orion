import type { BriefLifecycleState } from "@/types/executive";
import { cn } from "@/lib/utils";

type BriefStatusBannerProps = {
  lifecycle: BriefLifecycleState;
  changesSinceLastView?: number;
  lastSyncedAt: string;
};

const BANNER_COPY: Record<
  Exclude<BriefLifecycleState, "fresh">,
  { title: string; tone: string }
> = {
  updated: {
    title: "Brief updated since your last visit",
    tone: "border-orion-gold/25 bg-orion-gold/10 text-orion-text",
  },
  stale: {
    title: "Brief may be stale — sync recommended",
    tone: "border-amber-400/25 bg-amber-400/10 text-amber-100",
  },
  incomplete: {
    title: "Some data sources are unavailable",
    tone: "border-amber-400/25 bg-amber-400/10 text-amber-100",
  },
  offline: {
    title: "Showing cached brief — you are offline",
    tone: "border-white/10 bg-white/[0.04] text-orion-muted",
  },
};

/** Lifecycle banner — calm confidence when fresh; clear guidance when not. */
export function BriefStatusBanner({
  lifecycle,
  changesSinceLastView,
  lastSyncedAt,
}: BriefStatusBannerProps) {
  if (lifecycle === "fresh") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-orion-md border border-orion-border bg-orion-surface/60 px-4 py-2.5 text-sm font-light text-orion-muted"
      >
        <span className="font-medium text-orion-text/85">Brief ready</span>
        <span aria-hidden> · </span>
        <span>Last synced {lastSyncedAt}</span>
      </div>
    );
  }

  const copy = BANNER_COPY[lifecycle];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-orion-md border px-4 py-3 text-sm font-light",
        copy.tone,
      )}
    >
      <p className="font-medium">{copy.title}</p>
      <p className="mt-1 text-xs opacity-80">
        {lifecycle === "updated" && changesSinceLastView
          ? `${changesSinceLastView} changes since you last viewed · `
          : null}
        Last synced {lastSyncedAt}
      </p>
    </div>
  );
}
