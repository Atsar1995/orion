import { IntegrationFilters } from "@/components/integrations/IntegrationFilters";
import { SyncHistory } from "@/components/integrations/SyncHistory";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/StatCard";
import {
  WORKSPACE_GRID_2_COL,
  WORKSPACE_HEADER_BLOCK_CLASS,
  WORKSPACE_PAGE_CLASS,
  WORKSPACE_SECTION_CLASS,
  WORKSPACE_STAT_GRID_CLASS,
  WORKSPACE_SUBTITLE_CLASS,
  WORKSPACE_TITLE_CLASS,
} from "@/lib/constants";
import { getIntegrationCenterSnapshot } from "@/lib/integrations/integration-center";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const snapshot = await getIntegrationCenterSnapshot();
  const { dashboard } = snapshot;

  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <header className="space-y-4">
        <div className={WORKSPACE_HEADER_BLOCK_CLASS}>
          <h1 className={WORKSPACE_TITLE_CLASS}>Integration Center</h1>
          <p className={WORKSPACE_SUBTITLE_CLASS}>
            Manage external connections, provider health, credentials, and sync activity across
            ORION.
          </p>
        </div>

        <div className={WORKSPACE_STAT_GRID_CLASS}>
          <StatCard label="Connected Providers" value={String(dashboard.connectedProviders)} />
          <StatCard
            label="Disconnected Providers"
            value={String(dashboard.disconnectedProviders)}
          />
          <StatCard label="Healthy Providers" value={String(dashboard.healthyProviders)} />
          <StatCard label="Failed Connections" value={String(dashboard.failedConnections)} />
        </div>
      </header>

      <section aria-label="Integration dashboard" className={WORKSPACE_SECTION_CLASS}>
        <div className={WORKSPACE_GRID_2_COL}>
          <div className="space-y-4 rounded-orion-lg border border-white/[0.07] bg-white/[0.03] p-5">
            <SectionHeader
              title="Provider Health"
              subtitle="Live health summary from the Provider Framework and Orchestrator."
            />
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Healthy" value={String(dashboard.healthyProviders)} />
              <StatCard label="Unhealthy" value={String(dashboard.unhealthyProviders)} />
              <StatCard
                label="Token Expirations"
                value={String(dashboard.upcomingTokenExpirations)}
              />
              <StatCard label="Registered" value={String(snapshot.providers.length)} />
            </div>
          </div>

          <div className="space-y-4 rounded-orion-lg border border-white/[0.07] bg-white/[0.03] p-5">
            <SectionHeader
              title="Sync Activity"
              subtitle="Recent connection, sync, and health-check events."
            />
            <SyncHistory events={dashboard.recentSyncActivity} limit={5} />
          </div>
        </div>
      </section>

      <section aria-label="Integration providers" className={WORKSPACE_SECTION_CLASS}>
        <SectionHeader
          title="Registered Providers"
          subtitle="Connect, configure, and monitor every ORION integration from a single admin surface."
        />
        <IntegrationFilters snapshot={snapshot} />
      </section>
    </div>
  );
}
