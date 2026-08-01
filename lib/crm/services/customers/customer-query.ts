import type {
  CrmCustomerListItem,
  CrmCustomerListResult,
  CrmCustomerRecord,
  CustomerHealthLabel,
  CustomerListFilters,
  CustomerListQuery,
  CustomerListSortDirection,
  CustomerListSortField,
} from "@/lib/crm/models/customers";
import { paginateItems } from "@/lib/persistence/memory/shared";

const DEFAULT_PAGE_SIZE = 5;

function toListItem(record: CrmCustomerRecord): CrmCustomerListItem {
  return {
    id: record.id,
    name: record.name,
    company: record.company,
    industry: record.industry,
    status: record.status,
    healthScore: record.healthScore,
    healthLabel: record.healthLabel,
    lifetimeValue: record.lifetimeValue,
    lastContact: record.lastContact,
    assignedOwner: record.assignedOwner,
  };
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function matchesSearch(record: CrmCustomerRecord, search: string): boolean {
  const query = search.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return [record.name, record.company, record.industry, record.assignedOwner, record.status]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function matchesFilters(record: CrmCustomerRecord, filters: CustomerListFilters): boolean {
  if (filters.industry && filters.industry !== "all" && record.industry !== filters.industry) {
    return false;
  }

  if (filters.status && filters.status !== "all" && record.status !== filters.status) {
    return false;
  }

  if (
    filters.health &&
    filters.health !== "all" &&
    record.healthLabel !== filters.health
  ) {
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
  direction: CustomerListSortDirection,
): number {
  if (typeof left === "number" && typeof right === "number") {
    return direction === "asc" ? left - right : right - left;
  }

  return direction === "asc"
    ? String(left).localeCompare(String(right))
    : String(right).localeCompare(String(left));
}

function sortRecords(
  records: CrmCustomerRecord[],
  sortField: CustomerListSortField,
  sortDirection: CustomerListSortDirection,
): CrmCustomerRecord[] {
  return [...records].sort((left, right) => {
    switch (sortField) {
      case "company":
        return compareValues(left.company, right.company, sortDirection);
      case "industry":
        return compareValues(left.industry, right.industry, sortDirection);
      case "status":
        return compareValues(left.status, right.status, sortDirection);
      case "healthScore":
        return compareValues(left.healthScore, right.healthScore, sortDirection);
      case "lifetimeValue":
        return compareValues(left.lifetimeValueAmount, right.lifetimeValueAmount, sortDirection);
      case "lastContact":
        return compareValues(left.lastContact, right.lastContact, sortDirection);
      case "assignedOwner":
        return compareValues(left.assignedOwner, right.assignedOwner, sortDirection);
      case "name":
      default:
        return compareValues(left.name, right.name, sortDirection);
    }
  });
}

/** Queries placeholder customer records with search, filters, sort, and pagination. */
export function queryCustomerRecords(
  records: CrmCustomerRecord[],
  query: CustomerListQuery = {},
): CrmCustomerListResult {
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

  const healthLabels: CustomerHealthLabel[] = [
    "Excellent",
    "Good",
    "Needs Attention",
    "At Risk",
  ];

  return {
    items: paginated.items.map(toListItem),
    total: paginated.total,
    page: paginated.pagination.page,
    pageSize: paginated.pagination.pageSize,
    totalPages: Math.max(1, Math.ceil(paginated.total / paginated.pagination.pageSize)),
    filterOptions: {
      industries: uniqueSorted(records.map((record) => record.industry)),
      statuses: uniqueSorted(records.map((record) => record.status)),
      healthLabels,
      assignedOwners: uniqueSorted(records.map((record) => record.assignedOwner)),
    },
  };
}

export function findCustomerRecordById(
  records: CrmCustomerRecord[],
  customerId: string,
): CrmCustomerRecord | undefined {
  return records.find((record) => record.id === customerId);
}
