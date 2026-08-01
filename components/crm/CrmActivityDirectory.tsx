"use client";

import { useMemo, useTransition } from "react";
import { ActivityStatusBadge } from "@/components/crm/ActivityStatusBadge";
import { ActivityTypeBadge } from "@/components/crm/ActivityTypeBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchBox } from "@/components/ui/SearchBox";
import { QUICK_ACTION_BUTTON_CLASSNAME } from "@/lib/constants";
import type {
  ActivityDateRangeFilter,
  ActivityListQuery,
  ActivityListSortField,
  CrmActivityRecord,
  CrmActivityStatus,
  CrmActivityType,
  CrmActivityPriority,
} from "@/lib/crm/models/activities";
import { queryActivityRecords } from "@/lib/crm/services/activities/activity-query";
import { cn } from "@/lib/utils";

type CrmActivityDirectoryProps = {
  records: CrmActivityRecord[];
  query: ActivityListQuery;
  onQueryChange: (next: Partial<ActivityListQuery>) => void;
};

const SORT_COLUMNS: Array<{ field: ActivityListSortField; label: string }> = [
  { field: "type", label: "Type" },
  { field: "customer", label: "Customer" },
  { field: "owner", label: "Owner" },
  { field: "date", label: "Date" },
  { field: "status", label: "Status" },
  { field: "relatedOpportunity", label: "Related Opportunity" },
];

/** Interactive CRM activity list — search, filters, sort, pagination. */
export function CrmActivityDirectory({ records, query, onQueryChange }: CrmActivityDirectoryProps) {
  const [, startTransition] = useTransition();

  const result = useMemo(() => queryActivityRecords(records, query), [records, query]);

  function updateQuery(next: Partial<ActivityListQuery>) {
    startTransition(() => {
      onQueryChange({ ...next, page: next.page ?? 1 });
    });
  }

  function toggleSort(field: ActivityListSortField) {
    startTransition(() => {
      onQueryChange({
        sortField: field,
        sortDirection:
          query.sortField === field && query.sortDirection === "desc" ? "asc" : "desc",
        page: 1,
      });
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchBox
          value={query.search ?? ""}
          onChange={(value) => updateQuery({ search: value })}
          placeholder="Search activities..."
          className="max-w-md"
          id="crm-activity-search"
        />
        <p className="text-sm font-light text-white/45">
          {result.total} activit{result.total === 1 ? "y" : "ies"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        <label className="space-y-1">
          <span className="text-xs text-white/45">Activity Type</span>
          <select
            aria-label="Filter by activity type"
            className="w-full rounded-orion-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/85"
            value={query.filters?.type ?? "all"}
            onChange={(event) =>
              updateQuery({
                filters: {
                  ...query.filters,
                  type: event.target.value as CrmActivityType | "all",
                },
              })
            }
          >
            <option value="all">All types</option>
            {result.filterOptions.types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs text-white/45">Owner</span>
          <select
            aria-label="Filter by owner"
            className="w-full rounded-orion-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/85"
            value={query.filters?.owner ?? "all"}
            onChange={(event) =>
              updateQuery({
                filters: { ...query.filters, owner: event.target.value },
              })
            }
          >
            <option value="all">All owners</option>
            {result.filterOptions.owners.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1">
          <span className="text-xs text-white/45">Status</span>
          <select
            aria-label="Filter by status"
            className="w-full rounded-orion-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/85"
            value={query.filters?.status ?? "all"}
            onChange={(event) =>
              updateQuery({
                filters: {
                  ...query.filters,
                  status: event.target.value as CrmActivityStatus | "all",
                },
              })
            }
          >
            <option value="all">All statuses</option>
            {result.filterOptions.statuses.map((status) => (
              <option key={status} value={status}>
                {status}
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
                  priority: event.target.value as CrmActivityPriority | "all",
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
          <span className="text-xs text-white/45">Date Range</span>
          <select
            aria-label="Filter by date range"
            className="w-full rounded-orion-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/85"
            value={query.filters?.dateRange ?? "all"}
            onChange={(event) =>
              updateQuery({
                filters: {
                  ...query.filters,
                  dateRange: event.target.value as ActivityDateRangeFilter,
                },
              })
            }
          >
            <option value="all">All dates</option>
            <option value="today">Today</option>
            <option value="this_week">This week</option>
            <option value="this_month">This month</option>
          </select>
        </label>
      </div>

      <Card title="Activity List">
        {result.items.length === 0 ? (
          <EmptyState description="No activities match the current search or filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <caption className="sr-only">CRM activity list</caption>
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
                {result.items.map((activity) => (
                  <tr
                    key={activity.id}
                    className="border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-3 py-3">
                      <ActivityTypeBadge type={activity.type} />
                    </td>
                    <td className="px-3 py-3 font-light text-white/70">{activity.customer}</td>
                    <td className="px-3 py-3 font-light text-white/60">{activity.owner}</td>
                    <td className="px-3 py-3 font-light text-white/60">{activity.date}</td>
                    <td className="px-3 py-3">
                      <ActivityStatusBadge status={activity.status} />
                    </td>
                    <td className="px-3 py-3 font-light text-white/60">
                      {activity.relatedOpportunity ?? "—"}
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
