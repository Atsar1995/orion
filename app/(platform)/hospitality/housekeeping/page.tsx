import { CleaningQueue } from "@/components/hospitality/CleaningQueue";
import { HousekeepingDashboard } from "@/components/hospitality/HousekeepingDashboard";
import { HospitalityDataTable } from "@/components/hospitality/HospitalityDataTable";
import { HospitalitySectionHeader } from "@/components/hospitality/HospitalitySectionHeader";
import { MaintenancePanel } from "@/components/hospitality/MaintenancePanel";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { DEFAULT_PROPERTY_ID, hospitalityHousekeepingService } from "@/lib/hospitality";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

export const dynamic = "force-dynamic";

/** Housekeeping & maintenance operations platform (Mission P-007.5). */
export default async function HospitalityHousekeepingPage() {
  const { context } = await getDecisionServiceContext();
  const dashboard = hospitalityHousekeepingService.board.getDashboard(context, DEFAULT_PROPERTY_ID);
  const maintenance = hospitalityHousekeepingService.maintenance.getDashboard(context, DEFAULT_PROPERTY_ID);

  return (
    <>
      <HospitalitySectionHeader
        title="Housekeeping & Maintenance"
        subtitle="Room readiness, cleaning queue, preventive maintenance, inspections, and asset health."
      />
      <section aria-label="Hospitality Housekeeping" className={`${WORKSPACE_SECTION_CLASS} space-y-6`}>
        <HousekeepingDashboard dashboard={dashboard} />
        <div className="grid gap-6 lg:grid-cols-2">
          <CleaningQueue title="Cleaning Queue" items={dashboard.queue} />
          <HospitalityDataTable
            title="Room Status Board"
            caption={`${dashboard.board.length} room(s) tracked`}
            rows={dashboard.board}
            getRowKey={(row) => row.inventoryItemId}
            columns={[
              { key: "room", header: "Room", render: (row) => row.roomNumber },
              { key: "status", header: "Extended Status", render: (row) => row.extendedStatus },
              { key: "roomStatus", header: "Inventory", render: (row) => row.roomStatus },
              { key: "task", header: "Task", render: (row) => row.taskStatus ?? "—" },
              { key: "blocked", header: "Blocked", render: (row) => (row.isBlocked ? "Yes" : "—") },
            ]}
          />
        </div>
        <MaintenancePanel maintenance={maintenance} />
      </section>
    </>
  );
}
