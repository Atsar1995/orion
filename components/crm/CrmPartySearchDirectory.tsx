"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchBox } from "@/components/ui/SearchBox";
import type { PartySearchView } from "@/lib/crm/models/parties";
import { cn } from "@/lib/utils";

type CrmPartySearchDirectoryProps = {
  initialResults: PartySearchView;
};

const ROLE_LABELS: Record<string, string> = {
  guest: "Guest",
  customer: "Customer",
  corporate_contact: "Corporate Contact",
  travel_agent: "Travel Agent",
  tour_operator: "Tour Operator",
  supplier: "Supplier",
  vendor: "Vendor",
  employee: "Employee",
  investor: "Investor",
  partner: "Partner",
  prospect: "Prospect",
  member: "Member",
};

/** Universal party search directory (Mission P-008.1). */
export function CrmPartySearchDirectory({ initialResults }: CrmPartySearchDirectoryProps) {
  const [search, setSearch] = useState("");
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (!search) return initialResults.items;
    const query = search.toLowerCase();
    return initialResults.items.filter((item) =>
      [item.displayName, item.email, item.phone, ...item.roles].join(" ").toLowerCase().includes(query),
    );
  }, [initialResults.items, search]);

  return (
    <div className="space-y-5">
      <SearchBox
        value={search}
        onChange={(value) => startTransition(() => setSearch(value))}
        placeholder="Search all parties..."
        className="max-w-md"
        id="crm-party-search"
      />

      {filtered.length === 0 ? (
        <EmptyState title="No parties found" description="Try a different search term." />
      ) : (
        <Card title="Party Registry" subtitle={`${filtered.length} of ${initialResults.total} parties`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Kind</th>
                  <th className="px-3 py-2 font-medium">Roles</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Contact</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-2">
                      <Link
                        href={item.kind === "organisation" ? `/crm/companies/${item.id}` : `/crm/customers/${item.id.replace("person-", "")}`}
                        className="font-medium text-orion-gold/90 hover:text-orion-gold"
                      >
                        {item.displayName}
                      </Link>
                    </td>
                    <td className="px-3 py-2 capitalize">{item.kind}</td>
                    <td className="px-3 py-2">
                      {item.roles.map((role) => ROLE_LABELS[role] ?? role).join(", ")}
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn("capitalize", item.status === "active" && "text-emerald-400")}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{item.email ?? item.phone ?? "—"}</td>
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
