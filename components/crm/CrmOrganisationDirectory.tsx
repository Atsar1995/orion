"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchBox } from "@/components/ui/SearchBox";
import type { OrganisationListItem } from "@/lib/crm/models/parties";
import type { OrganisationType, PartyStatus } from "@/types/crm-party";
import { cn } from "@/lib/utils";

type CrmOrganisationDirectoryProps = {
  items: OrganisationListItem[];
  filterOptions: {
    organisationTypes: OrganisationType[];
    industries: string[];
    statuses: PartyStatus[];
    assignedOwners: string[];
  };
};

const TYPE_LABELS: Record<OrganisationType, string> = {
  corporate_account: "Corporate Account",
  travel_agency: "Travel Agency",
  tour_operator: "Tour Operator",
  government: "Government",
  supplier: "Supplier",
  partner: "Partner",
  association: "Association",
  education: "Education",
  ngo: "NGO",
  membership: "Membership",
  other: "Other",
};

/** Interactive CRM organisation directory (Mission P-008.1). */
export function CrmOrganisationDirectory({ items, filterOptions }: CrmOrganisationDirectoryProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<OrganisationType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<PartyStatus | "all">("all");
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (typeFilter !== "all" && item.organisationType !== typeFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (search) {
        const haystack = [item.displayName, item.industry, item.email, item.assignedOwner]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [items, search, typeFilter, statusFilter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchBox
          value={search}
          onChange={(value) => startTransition(() => setSearch(value))}
          placeholder="Search companies..."
          className="max-w-md"
          id="crm-company-search"
        />
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Organisation type filter"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={typeFilter}
            onChange={(event) =>
              startTransition(() => setTypeFilter(event.target.value as OrganisationType | "all"))
            }
          >
            <option value="all">All types</option>
            {filterOptions.organisationTypes.map((type) => (
              <option key={type} value={type}>
                {TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          <select
            aria-label="Status filter"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(event) =>
              startTransition(() => setStatusFilter(event.target.value as PartyStatus | "all"))
            }
          >
            <option value="all">All statuses</option>
            {filterOptions.statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No companies found"
          description="Adjust filters or create a new organisation record."
        />
      ) : (
        <Card className="overflow-hidden p-0" title="Company Directory">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Industry</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Contacts</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{item.displayName}</div>
                      {item.email ? <div className="text-xs text-muted-foreground">{item.email}</div> : null}
                    </td>
                    <td className="px-4 py-3">{TYPE_LABELS[item.organisationType]}</td>
                    <td className="px-4 py-3">{item.industry ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs capitalize",
                          item.status === "active" && "bg-emerald-500/10 text-emerald-700",
                          item.status === "prospect" && "bg-amber-500/10 text-amber-700",
                          item.status === "inactive" && "bg-muted text-muted-foreground",
                          item.status === "archived" && "bg-muted text-muted-foreground",
                        )}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{item.linkedContacts}</td>
                    <td className="px-4 py-3">{item.assignedOwner ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/crm/companies/${item.id}`}
                        className="font-medium text-orion-gold/90 hover:text-orion-gold"
                      >
                        View
                      </Link>
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
