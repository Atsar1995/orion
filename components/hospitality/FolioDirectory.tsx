import { HospitalityDataTable } from "@/components/hospitality/HospitalityDataTable";
import type { FolioListItem } from "@/lib/hospitality/models/billing";

type FolioDirectoryProps = {
  readonly folios: readonly FolioListItem[];
};

/** Guest folio directory (Mission P-007.6). */
export function FolioDirectory({ folios }: FolioDirectoryProps) {
  return (
    <HospitalityDataTable
      title="Guest Folios"
      caption={`${folios.length} folio(s)`}
      rows={folios}
      getRowKey={(row) => row.folioId}
      columns={[
        { key: "guest", header: "Guest", render: (row) => row.guestName },
        { key: "type", header: "Type", render: (row) => row.folioType },
        { key: "reservation", header: "Reservation", render: (row) => row.reservationId },
        { key: "status", header: "Status", render: (row) => row.status },
        { key: "charges", header: "Charges", render: (row) => row.charges },
        { key: "balance", header: "Balance", render: (row) => row.balance },
      ]}
    />
  );
}
