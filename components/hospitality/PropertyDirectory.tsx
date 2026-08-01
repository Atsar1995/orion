import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { WORKSPACE_GRID_4_COL } from "@/lib/constants";
import type { PropertyListItem } from "@/lib/hospitality/models/inventory";

type PropertyDirectoryProps = {
  portfolio: { name: string; description: string; propertyCount: number; totalInventory: number } | null;
  properties: readonly PropertyListItem[];
};

/** Property list directory (Mission P-007.1). */
export function PropertyDirectory({ portfolio, properties }: PropertyDirectoryProps) {
  if (properties.length === 0) {
    return (
      <EmptyState
        title="No properties"
        description="Create your first property to begin managing hospitality inventory."
      />
    );
  }

  return (
    <div className="space-y-6">
      {portfolio ? (
        <Card title={portfolio.name}>
          <p className="text-sm font-light text-white/65">{portfolio.description}</p>
          <div className={`mt-4 ${WORKSPACE_GRID_4_COL}`}>
            <StatCard label="Properties" value={String(portfolio.propertyCount)} />
            <StatCard label="Total Inventory" value={String(portfolio.totalInventory)} />
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {properties.map((property) => (
          <Link
            key={property.id}
            href={`/hospitality/properties/${property.id}`}
            className="rounded-orion-lg border border-white/[0.07] bg-white/[0.03] p-5 transition hover:border-orion-gold/20 hover:bg-white/[0.05]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-medium text-white/90">{property.name}</h2>
                <p className="mt-1 text-sm text-white/45">
                  {property.type} · {property.city}
                </p>
              </div>
              <span className="rounded-orion-md border border-white/[0.08] px-2 py-1 text-xs text-white/55">
                {property.operationalStatus}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div>
                <dt className="text-white/40">Inventory</dt>
                <dd className="font-medium text-white/80">{property.inventoryCount}</dd>
              </div>
              <div>
                <dt className="text-white/40">Unavailable</dt>
                <dd className="font-medium text-white/80">{property.unavailableCount}</dd>
              </div>
              <div>
                <dt className="text-white/40">Health</dt>
                <dd className="font-medium text-orion-gold">{property.healthScore}/100</dd>
              </div>
            </dl>
          </Link>
        ))}
      </div>
    </div>
  );
}
