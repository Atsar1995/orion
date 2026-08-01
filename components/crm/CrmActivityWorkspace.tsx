"use client";

import { useMemo, useState } from "react";
import { CrmActivityCalls } from "@/components/crm/CrmActivityCalls";
import { CrmActivityDirectory } from "@/components/crm/CrmActivityDirectory";
import { CrmActivityEmails } from "@/components/crm/CrmActivityEmails";
import { CrmActivityFilterBar } from "@/components/crm/CrmActivityFilterBar";
import { CrmActivityMeetings } from "@/components/crm/CrmActivityMeetings";
import { CrmActivityTasks } from "@/components/crm/CrmActivityTasks";
import { CrmActivityTimeline } from "@/components/crm/CrmActivityTimeline";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { WORKSPACE_GRID_2_COL, WORKSPACE_GRID_3_COL } from "@/lib/constants";
import type { ActivityListQuery, CrmActivityWorkspaceView } from "@/lib/crm/models/activities";
import {
  filterActivities,
  filterActivitiesByType,
} from "@/lib/crm/services/activities/activity-query";
import { cn } from "@/lib/utils";

type CrmActivityWorkspaceProps = {
  view: CrmActivityWorkspaceView;
};

type ActivityViewMode = "timeline" | "list";

const DEFAULT_QUERY: ActivityListQuery = {
  page: 1,
  pageSize: 5,
  sortField: "date",
  sortDirection: "desc",
  filters: {
    type: "all",
    owner: "all",
    status: "all",
    priority: "all",
    dateRange: "all",
  },
};

/** CRM activities workspace — dashboard, timeline, list, tasks, meetings, calls, emails. */
export function CrmActivityWorkspace({ view }: CrmActivityWorkspaceProps) {
  const [viewMode, setViewMode] = useState<ActivityViewMode>("timeline");
  const [query, setQuery] = useState<ActivityListQuery>(DEFAULT_QUERY);
  const { metrics, records } = view;

  const owners = useMemo(
    () => [...new Set(records.map((record) => record.owner))].sort(),
    [records],
  );

  const filteredRecords = useMemo(() => filterActivities(records, query), [records, query]);

  const timelineItems = useMemo(
    () =>
      filteredRecords.map((record) => ({
        id: record.id,
        type: record.type,
        customer: record.customer,
        date: record.date,
        time: record.time,
        owner: record.owner,
        status: record.status,
        description: record.description,
      })),
    [filteredRecords],
  );

  const tasks = useMemo(
    () =>
      filterActivities(filterActivitiesByType(records, "Task"), query).map((record) => ({
        id: record.id,
        customer: record.customer,
        description: record.description,
        owner: record.owner,
        date: record.date,
        status: record.status,
        priority: record.priority,
      })),
    [records, query],
  );

  const meetings = useMemo(
    () =>
      filterActivities(filterActivitiesByType(records, "Meeting"), query).map((record) => ({
        id: record.id,
        customer: record.customer,
        date: record.date,
        time: record.time,
        participants: record.participants ?? [],
        status: record.status,
      })),
    [records, query],
  );

  const calls = useMemo(
    () =>
      filterActivities(filterActivitiesByType(records, "Phone Call"), query).map((record) => ({
        id: record.id,
        customer: record.customer,
        date: record.date,
        duration: record.duration ?? "—",
        outcome: record.outcome ?? "—",
        followUpRequired: record.followUpRequired ?? false,
      })),
    [records, query],
  );

  const emails = useMemo(
    () =>
      filterActivities(filterActivitiesByType(records, "Email"), query).map((record) => ({
        id: record.id,
        subject: record.subject ?? record.description,
        customer: record.customer,
        date: record.date,
        status: record.status,
      })),
    [records, query],
  );

  function updateQuery(next: Partial<ActivityListQuery>) {
    setQuery((current) => ({
      ...current,
      ...next,
      filters: next.filters ? { ...current.filters, ...next.filters } : current.filters,
      page: next.page ?? current.page ?? 1,
    }));
  }

  return (
    <div className="space-y-6">
      <div className={`${WORKSPACE_GRID_3_COL} md:grid-cols-2 xl:grid-cols-5`}>
        <StatCard label="Calls Today" value={String(metrics.callsToday)} />
        <StatCard label="Meetings Scheduled" value={String(metrics.meetingsScheduled)} />
        <StatCard label="Emails Pending" value={String(metrics.emailsPending)} />
        <StatCard label="Tasks Due" value={String(metrics.tasksDue)} />
        <StatCard label="Overdue Activities" value={String(metrics.overdueActivities)} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex rounded-orion-md border border-white/[0.08] bg-white/[0.02] p-1"
          role="tablist"
          aria-label="Activity view mode"
        >
          <Button
            type="button"
            variant="primary"
            className={cn(
              "px-4 py-2 text-xs",
              viewMode !== "timeline" && "border-transparent bg-transparent text-white/55",
            )}
            role="tab"
            aria-selected={viewMode === "timeline"}
            onClick={() => setViewMode("timeline")}
          >
            Timeline
          </Button>
          <Button
            type="button"
            variant="primary"
            className={cn(
              "px-4 py-2 text-xs",
              viewMode !== "list" && "border-transparent bg-transparent text-white/55",
            )}
            role="tab"
            aria-selected={viewMode === "list"}
            onClick={() => setViewMode("list")}
          >
            List
          </Button>
        </div>
      </div>

      {viewMode === "list" ? (
        <CrmActivityDirectory records={records} query={query} onQueryChange={updateQuery} />
      ) : (
        <>
          <CrmActivityFilterBar query={query} owners={owners} onQueryChange={updateQuery} />
          <CrmActivityTimeline activities={timelineItems} />
          <div className={WORKSPACE_GRID_2_COL}>
            <CrmActivityTasks tasks={tasks} />
            <CrmActivityMeetings meetings={meetings} />
          </div>
          <div className={WORKSPACE_GRID_2_COL}>
            <CrmActivityCalls calls={calls} />
            <CrmActivityEmails emails={emails} />
          </div>
        </>
      )}
    </div>
  );
}
