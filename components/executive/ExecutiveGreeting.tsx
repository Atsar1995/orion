import type { BriefGreeting } from "@/types/executive";
import {
  WORKSPACE_GREETING_CLASS,
  WORKSPACE_HEADER_BLOCK_CLASS,
  WORKSPACE_SUBTITLE_CLASS,
  WORKSPACE_TITLE_CLASS,
} from "@/lib/constants";

type ExecutiveGreetingProps = {
  greeting: BriefGreeting;
  lastSyncedAt: string;
};

/** EC-001 executive greeting with orientation headline and sync metadata. */
export function ExecutiveGreeting({ greeting, lastSyncedAt }: ExecutiveGreetingProps) {
  return (
    <header className={WORKSPACE_HEADER_BLOCK_CLASS}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className={WORKSPACE_GREETING_CLASS}>
            {greeting.period}, {greeting.executiveName}.
          </p>
          <h1 className={WORKSPACE_TITLE_CLASS}>Morning Executive Brief</h1>
          <p className={WORKSPACE_SUBTITLE_CLASS}>
            Today&apos;s Brief · {greeting.dateLabel}
          </p>
        </div>
        <p className="text-xs font-light text-orion-muted sm:text-right">
          Last synced {lastSyncedAt}
        </p>
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-base font-medium text-orion-text md:text-lg">{greeting.headline}</p>
        <p className="text-sm font-light text-orion-muted">{greeting.subheadline}</p>
      </div>
    </header>
  );
}
