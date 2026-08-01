import type {
  ActivityDateRangeFilter,
  ActivityListFilters,
  ActivityListQuery,
  ActivityListSortDirection,
  ActivityListSortField,
  CrmActivityListItem,
  CrmActivityListResult,
  CrmActivityRecord,
  CrmActivityType,
} from "@/lib/crm/models/activities";
import {
  CRM_ACTIVITY_PRIORITIES,
  CRM_ACTIVITY_STATUSES,
  CRM_ACTIVITY_TYPES,
} from "@/lib/crm/data/activity-records";
import { paginateItems } from "@/lib/persistence/memory/shared";

const DEFAULT_PAGE_SIZE = 5;

const DATE_RANGE_OPTIONS: ActivityDateRangeFilter[] = [
  "all",
  "today",
  "this_week",
  "this_month",
];

function toListItem(record: CrmActivityRecord): CrmActivityListItem {
  return {
    id: record.id,
    type: record.type,
    customer: record.customer,
    owner: record.owner,
    date: record.date,
    status: record.status,
    relatedOpportunity: record.relatedOpportunity,
    priority: record.priority,
  };
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function matchesSearch(record: CrmActivityRecord, search: string): boolean {
  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return [
    record.type,
    record.customer,
    record.owner,
    record.status,
    record.description,
    record.relatedOpportunity ?? "",
    record.subject ?? "",
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function matchesDateRange(record: CrmActivityRecord, dateRange: ActivityDateRangeFilter): boolean {
  if (dateRange === "all") {
    return true;
  }

  const activityDate = record.dateTimeSort.slice(0, 10);

  if (dateRange === "today") {
    return activityDate === "2026-07-24";
  }

  if (dateRange === "this_week") {
    return activityDate >= "2026-07-21" && activityDate <= "2026-07-27";
  }

  if (dateRange === "this_month") {
    return activityDate.startsWith("2026-07");
  }

  return true;
}

function matchesFilters(record: CrmActivityRecord, filters: ActivityListFilters): boolean {
  if (filters.type && filters.type !== "all" && record.type !== filters.type) {
    return false;
  }

  if (filters.owner && filters.owner !== "all" && record.owner !== filters.owner) {
    return false;
  }

  if (filters.status && filters.status !== "all" && record.status !== filters.status) {
    return false;
  }

  if (filters.priority && filters.priority !== "all" && record.priority !== filters.priority) {
    return false;
  }

  if (filters.dateRange && !matchesDateRange(record, filters.dateRange)) {
    return false;
  }

  return true;
}

function compareValues(
  left: string | number,
  right: string | number,
  direction: ActivityListSortDirection,
): number {
  if (typeof left === "number" && typeof right === "number") {
    return direction === "asc" ? left - right : right - left;
  }

  return direction === "asc"
    ? String(left).localeCompare(String(right))
    : String(right).localeCompare(String(left));
}

function sortRecords(
  records: CrmActivityRecord[],
  sortField: ActivityListSortField,
  sortDirection: ActivityListSortDirection,
): CrmActivityRecord[] {
  return [...records].sort((left, right) => {
    switch (sortField) {
      case "customer":
        return compareValues(left.customer, right.customer, sortDirection);
      case "owner":
        return compareValues(left.owner, right.owner, sortDirection);
      case "date":
        return compareValues(left.dateTimeSort, right.dateTimeSort, sortDirection);
      case "status":
        return compareValues(left.status, right.status, sortDirection);
      case "relatedOpportunity":
        return compareValues(
          left.relatedOpportunity ?? "",
          right.relatedOpportunity ?? "",
          sortDirection,
        );
      case "type":
      default:
        return compareValues(left.type, right.type, sortDirection);
    }
  });
}

/** Queries placeholder activity records with search, filters, sort, and pagination. */
export function queryActivityRecords(
  records: CrmActivityRecord[],
  query: ActivityListQuery = {},
): CrmActivityListResult {
  const sortField = query.sortField ?? "date";
  const sortDirection = query.sortDirection ?? "desc";
  const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;

  const filtered = sortRecords(
    records.filter(
      (record) =>
        matchesSearch(record, query.search ?? "") &&
        matchesFilters(record, query.filters ?? {}),
    ),
    sortField,
    sortDirection,
  );

  const paginated = paginateItems(filtered, {
    page: query.page ?? 1,
    pageSize,
  });

  return {
    items: paginated.items.map(toListItem),
    total: paginated.total,
    page: paginated.pagination.page,
    pageSize: paginated.pagination.pageSize,
    totalPages: Math.max(1, Math.ceil(paginated.total / paginated.pagination.pageSize)),
    filterOptions: {
      types: CRM_ACTIVITY_TYPES,
      statuses: CRM_ACTIVITY_STATUSES,
      priorities: CRM_ACTIVITY_PRIORITIES,
      owners: uniqueSorted(records.map((record) => record.owner)),
      dateRanges: DATE_RANGE_OPTIONS,
    },
  };
}

export function findActivityRecordById(
  records: CrmActivityRecord[],
  activityId: string,
): CrmActivityRecord | undefined {
  return records.find((record) => record.id === activityId);
}

export function getTimelineActivities(records: CrmActivityRecord[]): CrmActivityRecord[] {
  return sortRecords(records, "date", "desc");
}

export function filterActivitiesByType(
  records: CrmActivityRecord[],
  type: CrmActivityType,
): CrmActivityRecord[] {
  return sortRecords(
    records.filter((record) => record.type === type),
    "date",
    "desc",
  );
}

export function filterActivities(
  records: CrmActivityRecord[],
  query: ActivityListQuery = {},
): CrmActivityRecord[] {
  return sortRecords(
    records.filter(
      (record) =>
        matchesSearch(record, query.search ?? "") &&
        matchesFilters(record, query.filters ?? {}),
    ),
    query.sortField ?? "date",
    query.sortDirection ?? "desc",
  );
}
