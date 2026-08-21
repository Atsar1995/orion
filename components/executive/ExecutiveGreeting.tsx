import type { BriefGreeting } from "@/types/executive";
import {
  ORION_EXECUTIVE_KICKER_CLASS,
  WORKSPACE_GREETING_CLASS,
  WORKSPACE_HEADER_BLOCK_CLASS,
  WORKSPACE_SUBTITLE_CLASS,
  WORKSPACE_TITLE_CLASS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

type ExecutiveGreetingProps = {
  greeting: BriefGreeting;
  lastSyncedAt: string;
  showSyncStatus?: boolean;
  /** Brief-only tighter header to keep top recommendation above the fold. */
  compact?: boolean;
};

const OPERATING_MODE_LABELS: Record<BriefGreeting["operatingMode"], string> = {
  standard: "Standard operating mode",
  growth: "Growth operating mode",
  recovery: "Recovery operating mode",
  planning: "Planning operating mode",
};

/** Executive Brief greeting — orientation within five seconds (Mission P-002). */
export function ExecutiveGreeting({
  greeting,
  lastSyncedAt,
  showSyncStatus = true,
  compact = false,
}: ExecutiveGreetingProps) {
  const metadataLine = `${greeting.organizationName} · ${greeting.profileLabel} · ${OPERATING_MODE_LABELS[greeting.operatingMode]}`;

  return (
    <header
      className={cn(WORKSPACE_HEADER_BLOCK_CLASS, compact && "space-y-1 pb-2")}
    >
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-start sm:justify-between",
          compact ? "gap-2" : "gap-3",
        )}
      >
        <div className={compact ? "space-y-1" : "space-y-2"}>
          {compact ? null : (
            <p className={ORION_EXECUTIVE_KICKER_CLASS}>Executive Brief v1.0</p>
          )}
          <p className={WORKSPACE_GREETING_CLASS}>
            {greeting.period}, {greeting.executiveName} · {greeting.dateLabel}
          </p>
          <h1 className={cn(WORKSPACE_TITLE_CLASS, compact && "text-2xl md:text-3xl")}>
            {greeting.headline}
          </h1>
          {compact ? null : (
            <p className={WORKSPACE_SUBTITLE_CLASS}>{greeting.subheadline}</p>
          )}
          {compact ? (
            <p className="mt-1 text-xs font-light text-orion-muted">{metadataLine}</p>
          ) : (
            <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs font-light text-orion-muted">
              <div>
                <dt className="inline">Organization: </dt>
                <dd className="inline text-orion-text/80">{greeting.organizationName}</dd>
              </div>
              <div>
                <dt className="inline">Profile: </dt>
                <dd className="inline text-orion-text/80">{greeting.profileLabel}</dd>
              </div>
              <div>
                <dt className="inline">Mode: </dt>
                <dd className="inline text-orion-text/80">
                  {OPERATING_MODE_LABELS[greeting.operatingMode]}
                </dd>
              </div>
            </dl>
          )}
        </div>
        {showSyncStatus ? (
          <p
            role="status"
            className="shrink-0 text-xs font-light text-orion-muted sm:max-w-[11rem] sm:text-right"
          >
            Intelligence synced · {lastSyncedAt}
          </p>
        ) : null}
      </div>
    </header>
  );
}
