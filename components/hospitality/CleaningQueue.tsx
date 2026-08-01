import { HospitalityDataTable } from "@/components/hospitality/HospitalityDataTable";
import type { HousekeepingBoardItem } from "@/lib/hospitality/models/housekeeping";

type CleaningQueueProps = {
  readonly title: string;
  readonly items: readonly HousekeepingBoardItem[];
};

/** Cleaning queue panel for housekeeping attendants (Mission P-007.5). */
export function CleaningQueue({ title, items }: CleaningQueueProps) {
  return (
    <HospitalityDataTable
      title={title}
      caption={`${items.length} task(s) in queue`}
      rows={items}
      getRowKey={(row) => row.taskId ?? row.inventoryItemId}
      columns={[
        { key: "room", header: "Room", render: (row) => row.roomNumber },
        { key: "status", header: "Status", render: (row) => row.extendedStatus },
        { key: "task", header: "Task", render: (row) => row.taskStatus ?? "—" },
        { key: "type", header: "Type", render: (row) => row.cleaningType?.replaceAll("_", " ") ?? "—" },
        { key: "assigned", header: "Assigned", render: (row) => row.assignedTo ?? "Unassigned" },
        { key: "priority", header: "Priority", render: (row) => row.priority },
      ]}
    />
  );
}
