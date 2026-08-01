"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { CustomerHealthBadge } from "@/components/crm/CustomerHealthBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchBox } from "@/components/ui/SearchBox";
import { QUICK_ACTION_BUTTON_CLASSNAME } from "@/lib/constants";
import type {
  CrmCustomerRecord,
  CustomerHealthLabel,
  CustomerListQuery,
  CustomerListSortField,
} from "@/lib/crm/models/customers";
import { queryCustomerRecords } from "@/lib/crm/services/customers/customer-query";
import { cn } from "@/lib/utils";

type CrmCustomerDirectoryProps = {
  records: CrmCustomerRecord[];
};

const SORT_COLUMNS: Array<{ field: CustomerListSortField; label: string }> = [
  { field: "name", label: "Customer Name" },
  { field: "company", label: "Company" },
  { field: "industry", label: "Industry" },
  { field: "status", label: "Status" },
  { field: "healthScore", label: "Health Score" },
  { field: "lifetimeValue", label: "Lifetime Value" },
  { field: "lastContact", label: "Last Contact" },
  { field: "assignedOwner", label: "Assigned Owner" },
];

/** Interactive CRM customer directory — search, filters, sort, pagination. */
export function CrmCustomerDirectory({ records }: CrmCustomerDirectoryProps) {
  const [query, setQuery] = useState<CustomerListQuery>({
    page: 1,
    pageSize: 5,
    sortField: "name",
    sortDirection: "asc",
    filters: {
      industry: "all",
      status: "all",
      health: "all",
      assignedOwner: "all",
    },
  });
  const [, startTransition] = useTransition();

  const result = useMemo(() => queryCustomerRecords(records, query), [records, query]);

  function updateQuery(next: Partial<CustomerListQuery>) {
    startTransition(() => {
      setQuery((current) => ({ ...current, ...next, page: next.page ?? 1 }));
    });
  }

  function toggleSort(field: CustomerListSortField) {
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
          placeholder="Search customers..."
          className="max-w-md"
          id="crm-customer-search"
        />
        <p className="text-sm font-light text-white/45">
          {result.total} customer{result.total === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1">
          <span className="text-xs text-white/45">Industry</span>
          <select
            aria-label="Filter by industry"
            className="w-full rounded-orion-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/85"
            value={query.filters?.industry ?? "all"}
            onChange={(event) =>
              updateQuery({
                filters: { ...query.filters, industry: event.target.value },
              })
            }
          >
            <option value="all">All industries</option>
            {result.filterOptions.industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
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
                filters: { ...query.filters, status: event.target.value },
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
          <span className="text-xs text-white/45">Health</span>
          <select
            aria-label="Filter by health"
            className="w-full rounded-orion-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/85"
            value={query.filters?.health ?? "all"}
            onChange={(event) =>
              updateQuery({
                filters: {
                  ...query.filters,
                  health: event.target.value as CustomerHealthLabel | "all",
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

      <Card title="Customer Directory">
        {result.items.length === 0 ? (
          <EmptyState description="No customers match the current search or filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <caption className="sr-only">CRM customer directory</caption>
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
                {result.items.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-3 py-3">
                      <Link
                        href={`/crm/customers/${customer.id}`}
                        className="font-medium text-orion-gold/90 hover:text-orion-gold"
                      >
                        {customer.name}
                      </Link>
                    </td>
                    <td className="px-3 py-3 font-light text-white/70">{customer.company}</td>
                    <td className="px-3 py-3 font-light text-white/60">{customer.industry}</td>
                    <td className="px-3 py-3 font-light text-white/60">{customer.status}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium tabular-nums text-white/85">
                          {customer.healthScore}
                        </span>
                        <CustomerHealthBadge label={customer.healthLabel} />
                      </div>
                    </td>
                    <td className="px-3 py-3 font-medium tabular-nums text-white/85">
                      {customer.lifetimeValue}
                    </td>
                    <td className="px-3 py-3 font-light text-white/60">{customer.lastContact}</td>
                    <td className="px-3 py-3 font-light text-white/60">{customer.assignedOwner}</td>
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
