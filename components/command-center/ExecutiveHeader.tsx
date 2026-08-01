import Link from "next/link";
import type { ReactNode } from "react";
import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { FOUNDER_NAME } from "@/lib/command-center-data";
import {
  countActiveAlerts,
  countPendingDecisions,
} from "@/lib/command-center/snapshot-view";
import {
  ORION_SECONDARY_LINK_CLASS,
  WORKSPACE_BODY_MUTED_CLASS,
  WORKSPACE_GREETING_CLASS,
  WORKSPACE_HEADER_BLOCK_CLASS,
  WORKSPACE_TITLE_CLASS,
} from "@/lib/constants";
import {
  formatWorkspaceDateLabel,
  getWorkspaceGreetingPeriod,
} from "@/lib/workspace-format";
import type { DashboardSnapshot } from "@/types/intelligence";
import { cn } from "@/lib/utils";

type ExecutiveHeaderProps = {
  snapshot: DashboardSnapshot;
};

/** Command Center header — operational clarity with live executive signals. */
export function ExecutiveHeader({ snapshot }: ExecutiveHeaderProps) {
  const activeAlerts = countActiveAlerts(snapshot);
  const pendingDecisions = countPendingDecisions(snapshot);

  return (
    <header className={WORKSPACE_HEADER_BLOCK_CLASS}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <p className={WORKSPACE_GREETING_CLASS}>
            {getWorkspaceGreetingPeriod()}, {FOUNDER_NAME}
          </p>
          <h1 className={WORKSPACE_TITLE_CLASS}>Executive Command Center</h1>
          <p className={WORKSPACE_BODY_MUTED_CLASS}>
            Real-time operational intelligence · {formatWorkspaceDateLabel()}
          </p>
          <Link href="/brief" className={cn("mt-2 inline-block", ORION_SECONDARY_LINK_CLASS)}>
            View full Morning Brief →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[32rem]">
          <HeaderStat
            label="Executive Health Score"
            value={`${snapshot.businessHealth.score}/${snapshot.businessHealth.maxScore}`}
            detail={<StatusIndicator status={snapshot.businessHealth.status} />}
          />
          <HeaderStat
            label="Active Alerts"
            value={String(activeAlerts)}
            detail={
              <span className="text-xs font-light text-orion-muted">
                {snapshot.alertPanel.counts.critical} critical
              </span>
            }
          />
          <HeaderStat
            label="Pending Decisions"
            value={String(pendingDecisions)}
            detail={
              <span className="text-xs font-light text-orion-muted">Ranked recommendations</span>
            }
          />
        </div>
      </div>
    </header>
  );
}

function HeaderStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: ReactNode;
}) {
  return (
    <div className="rounded-orion-md border border-orion-border bg-orion-surface p-[var(--orion-space-3)]">
      <p className="text-[10px] font-medium tracking-wide text-orion-muted uppercase">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-orion-text">{value}</p>
      {detail ? <div className="mt-2">{detail}</div> : null}
    </div>
  );
}
