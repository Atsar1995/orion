"use client";

import { useMemo, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchBox } from "@/components/ui/SearchBox";
import type { ProposalListItem } from "@/lib/crm/models/agreements";
import type { AgreementLifecycleStatus } from "@/types/crm-agreements";
import { cn } from "@/lib/utils";

type CrmProposalDirectoryProps = {
  items: ProposalListItem[];
};

const STATUS_COLORS: Partial<Record<AgreementLifecycleStatus, string>> = {
  draft: "text-muted-foreground",
  review: "text-amber-400",
  approved: "text-emerald-400",
  issued: "text-sky-400",
  rejected: "text-red-400",
};

/** Interactive CRM proposal directory (Mission P-008.3). */
export function CrmProposalDirectory({ items }: CrmProposalDirectoryProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AgreementLifecycleStatus | "all">("all");
  const [, startTransition] = useTransition();

  const statuses = useMemo(
    () => [...new Set(items.map((item) => item.status))].sort(),
    [items],
  );

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, search, statusFilter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchBox
          value={search}
          onChange={(value) => startTransition(() => setSearch(value))}
          placeholder="Search proposals..."
          className="max-w-md"
          id="crm-proposal-search"
        />
        <select
          aria-label="Proposal status filter"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(event) =>
            startTransition(() =>
              setStatusFilter(event.target.value as AgreementLifecycleStatus | "all"),
            )
          }
        >
          <option value="all">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No proposals found" description="Adjust filters or create a new proposal." />
      ) : (
        <Card title="Proposal Pipeline" subtitle={`${filtered.length} proposals`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Proposal</th>
                  <th className="px-3 py-2 font-medium">Customer</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Version</th>
                  <th className="px-3 py-2 font-medium">Total</th>
                  <th className="px-3 py-2 font-medium">Owner</th>
                  <th className="px-3 py-2 font-medium">Valid Until</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-2 font-medium">{item.title}</td>
                    <td className="px-3 py-2">{item.partyName}</td>
                    <td className="px-3 py-2">
                      <span className={cn("capitalize", STATUS_COLORS[item.status])}>
                        {item.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-3 py-2 tabular-nums">v{item.version}</td>
                    <td className="px-3 py-2">{item.total}</td>
                    <td className="px-3 py-2">{item.owner}</td>
                    <td className="px-3 py-2 text-muted-foreground">{item.validUntil ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
