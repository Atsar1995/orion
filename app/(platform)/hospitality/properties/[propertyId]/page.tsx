import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { HospitalityDataTable } from "@/components/hospitality/HospitalityDataTable";
import { HospitalitySectionHeader } from "@/components/hospitality/HospitalitySectionHeader";
import { WORKSPACE_GRID_4_COL, WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { hospitalityInventoryService } from "@/lib/hospitality";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

type PropertyDetailPageProps = {
  params: Promise<{ propertyId: string }>;
};

export const dynamic = "force-dynamic";

/** Hospitality property detail (Mission P-007.1). */
export default async function HospitalityPropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { propertyId } = await params;
  const { context } = await getDecisionServiceContext();
  const detail = hospitalityInventoryService.properties.getPropertyDetail(propertyId, context);

  if (!detail) {
    notFound();
  }

  const inventory = hospitalityInventoryService.inventory.listInventory(propertyId, context);
  const accommodationTypes = hospitalityInventoryService.accommodation.listAccommodationTypes(propertyId, context);

  return (
    <>
      <HospitalitySectionHeader
        title={detail.property.name}
        subtitle={`${detail.property.type.replaceAll("_", " ")} · ${detail.property.address}`}
      />
      <section aria-label="Property Detail" className={WORKSPACE_SECTION_CLASS}>
        <div className={WORKSPACE_GRID_4_COL}>
          <StatCard label="Inventory Units" value={String(detail.inventoryCount)} />
          <StatCard label="Zones" value={String(detail.zones.length)} />
          <StatCard label="Buildings" value={String(detail.buildings.length)} />
          <StatCard label="Accommodation Types" value={String(detail.accommodationTypes.length)} />
        </div>

        {detail.location ? (
          <Card title="Location">
            <p className="text-sm text-white/70">
              {detail.location.address}, {detail.location.city}, {detail.location.region},{" "}
              {detail.location.country}
            </p>
            <p className="mt-2 text-xs text-white/45">
              GPS: {detail.location.latitude}, {detail.location.longitude}
            </p>
          </Card>
        ) : null}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card title="Zones">
            <ul className="space-y-2">
              {detail.zones.map((zone) => (
                <li key={zone.id} className="text-sm text-white/70">
                  <span className="font-medium text-white/85">{zone.name}</span>
                  {zone.description ? ` — ${zone.description}` : null}
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Floor Plans & Media">
            <ul className="space-y-2">
              {detail.media.length === 0 ? (
                <li className="text-sm text-white/45">No media uploaded.</li>
              ) : (
                detail.media.map((asset) => (
                  <li key={asset.id} className="text-sm text-white/70">
                    {asset.type.replaceAll("_", " ")} — {asset.caption}
                  </li>
                ))
              )}
            </ul>
          </Card>
        </div>

        <HospitalityDataTable
          title="Accommodation Types"
          rows={accommodationTypes}
          getRowKey={(row) => row.id}
          columns={[
            { key: "name", header: "Name", render: (row) => row.name },
            { key: "kind", header: "Kind", render: (row) => row.kind },
            { key: "category", header: "Category", render: (row) => row.category },
            { key: "rate", header: "Base Rate", render: (row) => `₹${row.baseRate.toLocaleString("en-IN")}` },
            { key: "occupancy", header: "Max Occ.", render: (row) => row.maxOccupancy },
            { key: "units", header: "Units", render: (row) => row.inventoryCount },
          ]}
        />

        <HospitalityDataTable
          title="Inventory Units"
          caption={`${inventory.length} sellable unit(s)`}
          rows={inventory}
          getRowKey={(row) => row.id}
          columns={[
            { key: "label", header: "Unit", render: (row) => row.label },
            { key: "type", header: "Type", render: (row) => row.accommodationType },
            { key: "kind", header: "Kind", render: (row) => row.kind },
            { key: "status", header: "Status", render: (row) => row.status },
            { key: "maintenance", header: "Maintenance", render: (row) => row.maintenanceStatus },
            { key: "capacity", header: "Capacity", render: (row) => row.capacity },
          ]}
        />
      </section>
    </>
  );
}
