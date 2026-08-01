import Link from "next/link";
import { HospitalityDataTable } from "@/components/hospitality/HospitalityDataTable";
import type { GuestListViewItem } from "@/lib/hospitality/models/guests";

type GuestDirectoryProps = {
  readonly guests: readonly GuestListViewItem[];
  readonly total: number;
};

/** Searchable guest directory (Mission P-007.3). */
export function GuestDirectory({ guests, total }: GuestDirectoryProps) {
  return (
    <HospitalityDataTable
      title="Guest Profiles"
      caption={`${total} guest profile(s) — canonical guest intelligence platform`}
      rows={guests}
      getRowKey={(row) => row.id}
      columns={[
        {
          key: "name",
          header: "Name",
          render: (row) => (
            <Link href={`/hospitality/guests/${row.id}`} className="text-orion-gold hover:underline">
              {row.fullName}
              {row.isVip ? " · VIP" : ""}
            </Link>
          ),
        },
        { key: "email", header: "Email", render: (row) => row.email ?? "—" },
        { key: "company", header: "Company", render: (row) => row.company ?? "—" },
        { key: "tier", header: "Loyalty", render: (row) => row.loyaltyTier },
        { key: "stays", header: "Stays", render: (row) => row.stayCount },
        { key: "spend", header: "Lifetime Value", render: (row) => row.totalSpend },
        {
          key: "satisfaction",
          header: "Satisfaction",
          render: (row) => (row.satisfactionScore ? `${row.satisfactionScore}%` : "—"),
        },
      ]}
    />
  );
}
