"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchBox } from "@/components/ui/SearchBox";
import { QUICK_ACTION_BUTTON_CLASSNAME } from "@/lib/constants";
import type {
  CrmOpportunityRecord,
  OpportunityHealthLabel,
  OpportunityListQuery,
  OpportunityListSortField,
  OpportunityPriorityLabel,
  OpportunityStage,
} from "@/lib/crm/models/opportunities";
import { queryOpportunityRecords } from "@/lib/crm/services/opportunities/opportunity-query";
import { cn } from "@/lib/utils";

type CrmOpportunityDirectoryProps = {
  records: CrmOpportunityRecord[];
};

const SORT_COLUMNS: Array<{ field: OpportunityListSortField; label: string }> = [
  { field: "name", label: "Opportunity" },
  { field: "customer", label: "Customer" },
  { field: "stage", label: "Stage" },
  { field: "value", label: "Value" },
  { field: "probability", label: "Probability" },
  { field: "expectedClose", label: "Expected Close" },
  { field: "assignedOwner", label: "Owner" },
  { field: "lastUpdated", label: "Last Updated" },
];

/** Interactive CRM opportunity table — search, filters, sort, pagination. */
export function CrmOpportunityDirectory({ records }: CrmOpportunityDirectoryProps) {
  const [query, setQuery] = useState<OpportunityListQuery>({
    page: 1,
    pageSize: 5,
    sortField: "name",
    sortDirection: "asc",
    filters: {
      stage: "all",
      health: "all",
      priority: "all",
      assignedOwner: "all",
    },
  });
  const [, startTransition] = useTransition();

  const result = useMemo(() => queryOpportunityRecords(records, query), [records, query]);

  function updateQuery(next: Partial<OpportunityListQuery>) {
    startTransition(() => {
      setQuery((current) => ({ ...current, ...next, page: next.page ?? 1 }));
    });
  }

  function toggleSort(field: OpportunityListSortField) {
    startTransition(() => {
      setQuery((current) => ({
        ...current,
        sortField: field,
        sortDirection:
          current.sortField === field && current.sortDirection === "asc" ? "desc" : "asc",
        page: 1,
      }));
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchBox
          value={query.search ?? ""}
          onChange={(value) => updateQuery({ search: value })}
          placeholder="Search opportunities..."
          className="max-w-md"
          id="crm-opportunity-search"
        />
        <p className="text-sm font-light text-white/45">
          {result.total} opportunit{result.total === 1 ? "y" : "ies"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1">
          <span className="text-xs text-white/45">Stage</span>
          <select
            aria-label="Filter by stage"
            className="w-full rounded-orion-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/85"
            value={query.filters?.stage ?? "all"}
            onChange={(event) =>
              updateQuery({
                filters: {
                  ...query.filters,
                  stage: event.target.value as OpportunityStage | "all",
                },
              })
            }
          >
            <option value="all">All stages</option>
            {result.filterOptions.stages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs text-white/45">Health</span>
          <select
            aria-label="Filter by health"
            className="w-full rounded-orion-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/85"
            value={query.filters?.health ?? "all"}
            onChange={(event) =>
              updateQuery({
                filters: {
                  ...query.filters,
                  health: event.target.value as OpportunityHealthLabel | "all",
                },
              })
            }
          >
            <option value="all">All health levels</option>
            {result.filterOptions.healthLabels.map((health) => (
              <option key={health} value={health}>
                {health}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs text-white/45">Priority</span>
          <select
            aria-label="Filter by priority"
            className="w-full rounded-orion-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/85"
            value={query.filters?.priority ?? "all"}
            onChange={(event) =>
              updateQuery({
                filters: {
                  ...query.filters,
                  priority: event.target.value as OpportunityPriorityLabel | "all",
                },
              })
            }
          >
            <option value="all">All priorities</option>
            {result.filterOptions.priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs text-white/45">Assigned Owner</span>
          <select
            aria-label="Filter by assigned owner"
            className="w-full rounded-orion-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/85"
            value={query.filters?.assignedOwner ?? "all"}
            onChange={(event) =>
              updateQuery({
                filters: { ...query.filters, assignedOwner: event.target.value },
              })
            }
          >
            <option value="all">All owners</option>
            {result.filterOptions.assignedOwners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Card title="Opportunity List">
        {result.items.length === 0 ? (
          <EmptyState description="No opportunities match the current search or filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <caption className="sr-only">CRM opportunity list</caption>
              <thead>
                <tr className="border-b border-white/[0.06] text-xs tracking-wide text-white/40 uppercase">
                  {SORT_COLUMNS.map((column) => (
                    <th key={column.field} scope="col" className="px-3 py-3 font-medium">
                      <button
                        type="button"
                        onClick={() => toggleSort(column.field)}
                        className={cn(
                          QUICK_ACTION_BUTTON_CLASSNAME,
                          "rounded-orion-sm px-2 py-1 text-left text-xs",
                          query.sortField === column.field &&
                            "border-orion-gold/30 bg-orion-gold/10 text-orion-gold",
                        )}
                      >
                        {column.label}
                        {query.sortField === column.field
                          ? query.sortDirection === "asc"
                            ? " ↑"
                            : " ↓"
                          : ""}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.items.map((opportunity) => (
                  <tr
                    key={opportunity.id}
                    className="border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-3 py-3">
                      <Link
                        href={`/crm/opportunities/${opportunity.id}`}
                        className="font-medium text-orion-gold/90 hover:text-orion-gold"
                      >
                        {opportunity.name}
                      </Link>
                    </td>
                    <td className="px-3 py-3 font-light text-white/70">{opportunity.customer}</td>
                    <td className="px-3 py-3 font-light text-white/60">{opportunity.stage}</td>
                    <td className="px-3 py-3 font-medium tabular-nums text-white/85">
                      {opportunity.value}
                    </td>
                    <td className="px-3 py-3 font-light tabular-nums text-white/60">
                      {opportunity.probability}%
                    </td>
                    <td className="px-3 py-3 font-light text-white/60">
                      {opportunity.expectedClose}
                    </td>
                    <td className="px-3 py-3 font-light text-white/60">
                      {opportunity.assignedOwner}
                    </td>
                    <td className="px-3 py-3 font-light text-white/60">
                      {opportunity.lastUpdated}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {result.totalPages > 1 ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
            <p className="text-sm font-light text-white/45">
              Page {result.page} of {result.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="primary"
                className="px-4 py-2 text-xs"
                disabled={result.page <= 1}
                onClick={() => updateQuery({ page: Math.max(1, result.page - 1) })}
              >
                Previous
              </Button>
              <Button
                variant="primary"
                className="px-4 py-2 text-xs"
                disabled={result.page >= result.totalPages}
                onClick={() => updateQuery({ page: result.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
