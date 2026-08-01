"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchBox } from "@/components/ui/SearchBox";
import type { LeadListItem } from "@/lib/crm/models/commercial";
import type { LeadSource, LeadStatus } from "@/types/crm-commercial";
import { cn } from "@/lib/utils";

const SOURCE_LABELS: Record<LeadSource, string> = {
  website: "Website",
  referral: "Referral",
  travel_agent: "Travel Agent",
  corporate: "Corporate",
  campaign: "Campaign",
  walk_in: "Walk-in",
  phone: "Phone",
  email: "Email",
  social_media: "Social Media",
  import: "Import",
};

type CrmLeadDirectoryProps = {
  items: LeadListItem[];
  filterOptions: {
    sources: LeadSource[];
    statuses: LeadStatus[];
    owners: string[];
  };
};

/** Interactive CRM lead directory (Mission P-008.2). */
export function CrmLeadDirectory({ items, filterOptions }: CrmLeadDirectoryProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (search && !item.displayName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, search, statusFilter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchBox
          value={search}
          onChange={(value) => startTransition(() => setSearch(value))}
          placeholder="Search leads..."
          className="max-w-md"
          id="crm-lead-search"
        />
        <select
          aria-label="Lead status filter"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(event) =>
            startTransition(() => setStatusFilter(event.target.value as LeadStatus | "all"))
          }
        >
          <option value="all">All statuses</option>
          {filterOptions.statuses.map((status) => (
            <option key={status} value={status}>
              {status.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No leads found" description="Adjust filters or create a new lead." />
      ) : (
        <Card title="Lead Pipeline" subtitle={`${filtered.length} leads`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Lead</th>
                  <th className="px-3 py-2 font-medium">Source</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Value</th>
                  <th className="px-3 py-2 font-medium">Score</th>
                  <th className="px-3 py-2 font-medium">Owner</th>
                  <th className="px-3 py-2 font-medium">Next Activity</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-2">
                      <Link
                        href={`/crm/leads/${item.id}`}
                        className="font-medium text-orion-gold/90 hover:text-orion-gold"
                      >
                        {item.displayName}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{SOURCE_LABELS[item.source]}</td>
                    <td className="px-3 py-2">
                      <span className={cn("capitalize", item.status === "qualified" && "text-emerald-400")}>
                        {item.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-3 py-2">{item.estimatedValue}</td>
                    <td className="px-3 py-2 tabular-nums">{item.probability}</td>
                    <td className="px-3 py-2">{item.owner}</td>
                    <td className="px-3 py-2 text-muted-foreground">{item.nextActivity ?? "—"}</td>
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
