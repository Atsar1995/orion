"use client";

import { SearchBox } from "@/components/ui/SearchBox";
import type {
  ActivityDateRangeFilter,
  ActivityListQuery,
  CrmActivityPriority,
  CrmActivityStatus,
  CrmActivityType,
} from "@/lib/crm/models/activities";
import {
  CRM_ACTIVITY_PRIORITIES,
  CRM_ACTIVITY_STATUSES,
  CRM_ACTIVITY_TYPES,
} from "@/lib/crm/data/activity-records";

type CrmActivityFilterBarProps = {
  query: ActivityListQuery;
  owners: string[];
  onQueryChange: (next: Partial<ActivityListQuery>) => void;
  searchId?: string;
};

/** Shared CRM activity filters — search, type, owner, status, priority, date range. */
export function CrmActivityFilterBar({
  query,
  owners,
  onQueryChange,
  searchId = "crm-activity-filter-search",
}: CrmActivityFilterBarProps) {
  return (
    <div className="space-y-5">
      <SearchBox
        value={query.search ?? ""}
        onChange={(value) => onQueryChange({ search: value, page: 1 })}
        placeholder="Search activities..."
        className="max-w-md"
        id={searchId}
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        <label className="space-y-1">
          <span className="text-xs text-white/45">Activity Type</span>
          <select
            aria-label="Filter by activity type"
            className="w-full rounded-orion-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/85"
            value={query.filters?.type ?? "all"}
            onChange={(event) =>
              onQueryChange({
                filters: {
                  ...query.filters,
                  type: event.target.value as CrmActivityType | "all",
                },
                page: 1,
              })
            }
          >
            <option value="all">All types</option>
            {CRM_ACTIVITY_TYPES.map((type) => (
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
              onQueryChange({
                filters: { ...query.filters, owner: event.target.value },
                page: 1,
              })
            }
          >
            <option value="all">All owners</option>
            {owners.map((owner) => (
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
              onQueryChange({
                filters: {
                  ...query.filters,
                  status: event.target.value as CrmActivityStatus | "all",
                },
                page: 1,
              })
            }
          >
            <option value="all">All statuses</option>
            {CRM_ACTIVITY_STATUSES.map((status) => (
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
              onQueryChange({
                filters: {
                  ...query.filters,
                  priority: event.target.value as CrmActivityPriority | "all",
                },
                page: 1,
              })
            }
          >
            <option value="all">All priorities</option>
            {CRM_ACTIVITY_PRIORITIES.map((priority) => (
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
              onQueryChange({
                filters: {
                  ...query.filters,
                  dateRange: event.target.value as ActivityDateRangeFilter,
                },
                page: 1,
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
    </div>
  );
}
