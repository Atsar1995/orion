import { InventoryExplorer } from "@/components/hospitality/InventoryExplorer";
import { HospitalitySectionHeader } from "@/components/hospitality/HospitalitySectionHeader";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { WORKSPACE_GRID_4_COL, WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { hospitalityInventoryService } from "@/lib/hospitality";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

export const dynamic = "force-dynamic";

/** Hospitality inventory explorer (Mission P-007.1). */
export default async function HospitalityInventoryPage() {
  const { context } = await getDecisionServiceContext();
  const explorer = hospitalityInventoryService.inventory.getExplorerView(context);
  const analytics = hospitalityInventoryService.analytics.getAnalytics(context);

  return (
    <>
      <HospitalitySectionHeader
        title="Inventory"
        subtitle="Search, filter, and explore accommodation inventory across the portfolio."
      />
      <section aria-label="Hospitality Inventory" className={WORKSPACE_SECTION_CLASS}>
        <div className={WORKSPACE_GRID_4_COL}>
          <StatCard label="Total Inventory" value={String(analytics.totalInventory)} />
          <StatCard label="Inventory Health" value={`${analytics.inventoryHealthScore}/100`} />
          <StatCard label="Unavailable" value={String(analytics.unavailableInventory)} />
          <StatCard label="Total Capacity" value={String(analytics.totalCapacity)} />
        </div>

        <Card title="Inventory Analytics">
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {analytics.inventoryByKind.map((entry) => (
              <li key={entry.kind} className="text-sm text-white/70">
                {entry.kind}: <span className="text-orion-gold">{entry.count}</span>
              </li>
            ))}
          </ul>
        </Card>

        <InventoryExplorer items={explorer.items} properties={explorer.properties} />
      </section>
    </>
  );
}
