import type {
  CrmOpportunityListItem,
  CrmOpportunityListResult,
  CrmOpportunityRecord,
  OpportunityHealthLabel,
  OpportunityListFilters,
  OpportunityListQuery,
  OpportunityListSortDirection,
  OpportunityListSortField,
  OpportunityPriorityLabel,
  OpportunityStage,
} from "@/lib/crm/models/opportunities";
import { OPPORTUNITY_STAGES } from "@/lib/crm/data/opportunity-records";
import { paginateItems } from "@/lib/persistence/memory/shared";

const DEFAULT_PAGE_SIZE = 5;

function toListItem(record: CrmOpportunityRecord): CrmOpportunityListItem {
  return {
    id: record.id,
    name: record.name,
    customer: record.customer,
    stage: record.stage,
    value: record.value,
    probability: record.probability,
    expectedClose: record.expectedClose,
    assignedOwner: record.assignedOwner,
    lastUpdated: record.lastUpdated,
    healthLabel: record.healthLabel,
    priority: record.priority,
  };
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function matchesSearch(record: CrmOpportunityRecord, search: string): boolean {
  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return [
    record.name,
    record.customer,
    record.stage,
    record.assignedOwner,
    record.nextAction,
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function matchesFilters(record: CrmOpportunityRecord, filters: OpportunityListFilters): boolean {
  if (filters.stage && filters.stage !== "all" && record.stage !== filters.stage) {
    return false;
  }

  if (filters.health && filters.health !== "all" && record.healthLabel !== filters.health) {
    return false;
  }

  if (filters.priority && filters.priority !== "all" && record.priority !== filters.priority) {
    return false;
  }

  if (
    filters.assignedOwner &&
    filters.assignedOwner !== "all" &&
    record.assignedOwner !== filters.assignedOwner
  ) {
    return false;
  }

  return true;
}

function compareValues(
  left: string | number,
  right: string | number,
  direction: OpportunityListSortDirection,
): number {
  if (typeof left === "number" && typeof right === "number") {
    return direction === "asc" ? left - right : right - left;
  }

  return direction === "asc"
    ? String(left).localeCompare(String(right))
    : String(right).localeCompare(String(left));
}

function sortRecords(
  records: CrmOpportunityRecord[],
  sortField: OpportunityListSortField,
  sortDirection: OpportunityListSortDirection,
): CrmOpportunityRecord[] {
  return [...records].sort((left, right) => {
    switch (sortField) {
      case "customer":
        return compareValues(left.customer, right.customer, sortDirection);
      case "stage":
        return compareValues(left.stage, right.stage, sortDirection);
      case "value":
        return compareValues(left.valueAmount, right.valueAmount, sortDirection);
      case "probability":
        return compareValues(left.probability, right.probability, sortDirection);
      case "expectedClose":
        return compareValues(left.expectedClose, right.expectedClose, sortDirection);
      case "assignedOwner":
        return compareValues(left.assignedOwner, right.assignedOwner, sortDirection);
      case "lastUpdated":
        return compareValues(left.lastUpdated, right.lastUpdated, sortDirection);
      case "name":
      default:
        return compareValues(left.name, right.name, sortDirection);
    }
  });
}

function isOpenOpportunity(record: CrmOpportunityRecord): boolean {
  return record.stage !== "Won" && record.stage !== "Lost";
}

/** Queries placeholder opportunity records with search, filters, sort, and pagination. */
export function queryOpportunityRecords(
  records: CrmOpportunityRecord[],
  query: OpportunityListQuery = {},
): CrmOpportunityListResult {
  const sortField = query.sortField ?? "name";
  const sortDirection = query.sortDirection ?? "asc";
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

  const healthLabels: OpportunityHealthLabel[] = [
    "Healthy",
    "Needs Attention",
    "High Risk",
    "Closed Won",
    "Closed Lost",
  ];

  const priorities: OpportunityPriorityLabel[] = ["High", "Medium", "Low"];

  return {
    items: paginated.items.map(toListItem),
    total: paginated.total,
    page: paginated.pagination.page,
    pageSize: paginated.pagination.pageSize,
    totalPages: Math.max(1, Math.ceil(paginated.total / paginated.pagination.pageSize)),
    filterOptions: {
      stages: OPPORTUNITY_STAGES,
      healthLabels,
      priorities,
      assignedOwners: uniqueSorted(records.map((record) => record.assignedOwner)),
    },
  };
}

export function findOpportunityRecordById(
  records: CrmOpportunityRecord[],
  opportunityId: string,
): CrmOpportunityRecord | undefined {
  return records.find((record) => record.id === opportunityId);
}

export function groupOpportunitiesByStage(
  records: CrmOpportunityRecord[],
  query: OpportunityListQuery = {},
): Record<OpportunityStage, CrmOpportunityListItem[]> {
  const filtered = sortRecords(
    records.filter(
      (record) =>
        matchesSearch(record, query.search ?? "") &&
        matchesFilters(record, query.filters ?? {}),
    ),
    query.sortField ?? "name",
    query.sortDirection ?? "asc",
  );

  const columns = Object.fromEntries(
    OPPORTUNITY_STAGES.map((stage) => [stage, [] as CrmOpportunityListItem[]]),
  ) as Record<OpportunityStage, CrmOpportunityListItem[]>;

  for (const record of filtered) {
    columns[record.stage].push(toListItem(record));
  }

  return columns;
}

export function getOpenOpportunityRecords(records: CrmOpportunityRecord[]): CrmOpportunityRecord[] {
  return records.filter(isOpenOpportunity);
}
