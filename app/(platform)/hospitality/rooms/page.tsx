import { HospitalityDataTable } from "@/components/hospitality/HospitalityDataTable";
import { HospitalitySectionHeader } from "@/components/hospitality/HospitalitySectionHeader";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { WORKSPACE_GRID_4_COL, WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { hospitalityService } from "@/lib/hospitality";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

export const dynamic = "force-dynamic";

/** Hospitality room inventory (Mission P-007). */
export default async function HospitalityRoomsPage() {
  const { context } = await getDecisionServiceContext();
  const structure = hospitalityService.getPropertyStructure(context);
  const rooms = hospitalityService.listRooms(context);

  if (!structure) {
    return null;
  }

  const statusCounts = rooms.reduce<Record<string, number>>((acc, room) => {
    acc[room.status] = (acc[room.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <HospitalitySectionHeader
        title="Rooms"
        subtitle={`${structure.property.name} — buildings, wings, floors, and room inventory.`}
      />
      <section aria-label="Hospitality Rooms" className={WORKSPACE_SECTION_CLASS}>
        <Card title="Property Structure">
          <p className="mb-4 text-sm font-light text-white/55">
            {structure.buildings.length} building(s) · {structure.roomTypes.length} room type(s) ·{" "}
            {rooms.length} room(s)
          </p>
          <div className={WORKSPACE_GRID_4_COL}>
            {Object.entries(statusCounts).map(([status, count]) => (
              <StatCard key={status} label={status} value={String(count)} />
            ))}
          </div>
        </Card>
        <HospitalityDataTable
          title="Room Inventory"
          rows={rooms}
          getRowKey={(row) => row.id}
          columns={[
            { key: "number", header: "Room", render: (row) => row.number },
            { key: "type", header: "Type", render: (row) => row.roomType },
            { key: "floor", header: "Location", render: (row) => row.floor },
            { key: "status", header: "Status", render: (row) => row.status },
            { key: "vip", header: "VIP", render: (row) => (row.isVip ? "Yes" : "—") },
          ]}
        />
      </section>
    </>
  );
}
