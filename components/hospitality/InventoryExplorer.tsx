"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchBox } from "@/components/ui/SearchBox";
import { WORKSPACE_CAPTION_CLASS } from "@/lib/constants";
import type { InventoryListItem } from "@/lib/hospitality/models/inventory";

type InventoryExplorerProps = {
  items: readonly InventoryListItem[];
  properties: readonly { id: string; name: string; count: number }[];
};

/** Interactive inventory explorer with search and filters (Mission P-007.1). */
export function InventoryExplorer({ items, properties }: InventoryExplorerProps) {
  const [query, setQuery] = useState("");
  const [propertyId, setPropertyId] = useState("all");
  const [kind, setKind] = useState("all");
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (propertyId !== "all" && item.propertyId !== propertyId) return false;
      if (kind !== "all" && item.kind !== kind) return false;
      if (query) {
        const haystack = `${item.label} ${item.propertyName} ${item.accommodationType}`.toLowerCase();
        if (!haystack.includes(query.toLowerCase())) return false;
      }
      return true;
    });
  }, [items, propertyId, kind, query]);

  if (items.length === 0) {
    return (
      <EmptyState
        title="No inventory"
        description="No accommodation units are configured for this organization yet."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <SearchBox
          value={query}
          onChange={(value) => startTransition(() => setQuery(value))}
          placeholder="Search inventory..."
          className="max-w-md"
          id="inventory-search"
        />
        <div className="flex flex-wrap gap-3">
          <label className="text-xs text-white/45">
            Property
            <select
              value={propertyId}
              onChange={(event) => startTransition(() => setPropertyId(event.target.value))}
              className="ml-2 rounded-orion-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/80"
            >
              <option value="all">All properties</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-white/45">
            Kind
            <select
              value={kind}
              onChange={(event) => startTransition(() => setKind(event.target.value))}
              className="ml-2 rounded-orion-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/80"
            >
              <option value="all">All kinds</option>
              {["room", "suite", "villa", "houseboat"].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <Card title="Inventory Explorer">
        <p className={`mb-4 ${WORKSPACE_CAPTION_CLASS}`}>{filtered.length} unit(s)</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <caption className="sr-only">Inventory explorer</caption>
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Unit", "Property", "Type", "Kind", "Status", "Capacity", "Accessible"].map((header) => (
                  <th key={header} scope="col" className={`px-3 py-2 ${WORKSPACE_CAPTION_CLASS}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm text-white/45">
                    No inventory matches the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-3 py-3 font-medium text-orion-gold">{item.label}</td>
                    <td className="px-3 py-3 text-white/70">
                      <Link href={`/hospitality/properties/${item.propertyId}`} className="hover:underline">
                        {item.propertyName}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-white/70">{item.accommodationType}</td>
                    <td className="px-3 py-3 text-white/70">{item.kind}</td>
                    <td className="px-3 py-3 text-white/70">{item.status}</td>
                    <td className="px-3 py-3 text-white/70">{item.capacity}</td>
                    <td className="px-3 py-3 text-white/70">{item.accessible ? "Yes" : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
