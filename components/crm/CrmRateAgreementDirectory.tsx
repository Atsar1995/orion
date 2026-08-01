"use client";

import { useMemo, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchBox } from "@/components/ui/SearchBox";
import type { RateAgreementListItem } from "@/lib/crm/models/agreements";

type CrmRateAgreementDirectoryProps = {
  items: RateAgreementListItem[];
};

/** Rate agreement directory (Mission P-008.3). */
export function CrmRateAgreementDirectory({ items }: CrmRateAgreementDirectoryProps) {
  const [search, setSearch] = useState("");
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (!search) return items;
    return items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  }, [items, search]);

  return (
    <div className="space-y-5">
      <SearchBox
        value={search}
        onChange={(value) => startTransition(() => setSearch(value))}
        placeholder="Search rate agreements..."
        className="max-w-md"
        id="crm-rate-agreement-search"
      />

      {filtered.length === 0 ? (
        <EmptyState title="No rate agreements found" description="Adjust search or create a new rate agreement." />
      ) : (
        <Card title="Rate Agreements" subtitle={`${filtered.length} agreements`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Customer</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Season</th>
                  <th className="px-3 py-2 font-medium">Valid</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-2 font-medium">{item.name}</td>
                    <td className="px-3 py-2">{item.partyName}</td>
                    <td className="px-3 py-2 capitalize">{item.agreementType.replace(/_/g, " ")}</td>
                    <td className="px-3 py-2 capitalize">{item.status.replace(/_/g, " ")}</td>
                    <td className="px-3 py-2">{item.season ?? "—"}</td>
                    <td className="px-3 py-2">
                      {item.validFrom} — {item.validTo}
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
