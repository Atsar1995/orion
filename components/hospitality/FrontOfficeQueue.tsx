import Link from "next/link";
import { HospitalityDataTable } from "@/components/hospitality/HospitalityDataTable";
import type { FrontOfficeQueueItem } from "@/lib/hospitality/models/front-office";

type FrontOfficeQueueProps = {
  readonly title: string;
  readonly items: readonly FrontOfficeQueueItem[];
};

/** Front office queue table (Mission P-007.4). */
export function FrontOfficeQueue({ title, items }: FrontOfficeQueueProps) {
  return (
    <HospitalityDataTable
      title={title}
      caption={`${items.length} item(s)`}
      rows={items}
      getRowKey={(row) => row.stayId}
      columns={[
        {
          key: "guest",
          header: "Guest",
          render: (row) => (
            <Link href={`/hospitality/guests/${row.guestId}`} className="text-orion-gold hover:underline">
              {row.guestName}
              {row.isVip ? " · VIP" : ""}
            </Link>
          ),
        },
        {
          key: "reservation",
          header: "Reservation",
          render: (row) => (
            <Link href={`/hospitality/reservations/${row.reservationId}`} className="text-orion-gold hover:underline">
              {row.reservationNumber}
            </Link>
          ),
        },
        { key: "room", header: "Room", render: (row) => row.inventoryLabel ?? "Unassigned" },
        { key: "ready", header: "Ready", render: (row) => (row.roomAssigned ? (row.roomReady ? "Yes" : "No") : "—") },
        { key: "eta", header: "ETA", render: (row) => row.expectedArrivalTime ?? "15:00" },
        { key: "status", header: "Status", render: (row) => row.status.replaceAll("_", " ") },
      ]}
    />
  );
}
