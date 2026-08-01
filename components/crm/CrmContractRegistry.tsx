"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchBox } from "@/components/ui/SearchBox";
import type { ContractListItem } from "@/lib/crm/models/agreements";
import type { AgreementLifecycleStatus } from "@/types/crm-agreements";
import { cn } from "@/lib/utils";

type CrmContractRegistryProps = {
  items: ContractListItem[];
};

/** Interactive CRM contract registry (Mission P-008.3). */
export function CrmContractRegistry({ items }: CrmContractRegistryProps) {
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
          placeholder="Search contracts..."
          className="max-w-md"
          id="crm-contract-search"
        />
        <select
          aria-label="Contract status filter"
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
        <EmptyState title="No contracts found" description="Adjust filters or register a new contract." />
      ) : (
        <Card title="Contract Registry" subtitle={`${filtered.length} contracts`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Contract</th>
                  <th className="px-3 py-2 font-medium">Customer</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Total</th>
                  <th className="px-3 py-2 font-medium">Effective</th>
                  <th className="px-3 py-2 font-medium">Expiry</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-2">
                      <Link
                        href={`/crm/contracts/${item.id}`}
                        className="font-medium text-orion-gold/90 hover:text-orion-gold"
                      >
                        {item.title}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{item.partyName}</td>
                    <td className="px-3 py-2 capitalize">{item.contractType.replace(/_/g, " ")}</td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          "capitalize",
                          item.status === "active" && "text-emerald-400",
                          item.status === "approved" && "text-sky-400",
                          item.daysToExpiry !== undefined && item.daysToExpiry <= 45 && "text-amber-400",
                        )}
                      >
                        {item.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-3 py-2">{item.total}</td>
                    <td className="px-3 py-2">{item.effectiveFrom}</td>
                    <td className="px-3 py-2">
                      {item.effectiveTo}
                      {item.daysToExpiry !== undefined && item.daysToExpiry <= 45 ? (
                        <span className="ml-1 text-xs text-amber-400">({item.daysToExpiry}d)</span>
                      ) : null}
                    </td>
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
