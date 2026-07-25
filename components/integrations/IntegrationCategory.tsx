import { SectionHeader } from "@/components/ui/SectionHeader";
import { IntegrationCard } from "@/components/integrations/IntegrationCard";
import type {
  IntegrationCategory,
  IntegrationLogEntry,
  IntegrationProviderRecord,
  IntegrationSyncEvent,
} from "@/lib/integrations/types";
import { WORKSPACE_GRID_INTEGRATIONS_COL } from "@/lib/constants";

type IntegrationCategoryProps = {
  category: IntegrationCategory;
  label: string;
  description: string;
  providers: IntegrationProviderRecord[];
  syncHistory: IntegrationSyncEvent[];
  logs: IntegrationLogEntry[];
};

/** Groups provider cards under a category section. */
export function IntegrationCategory({
  label,
  description,
  providers,
  syncHistory,
  logs,
}: IntegrationCategoryProps) {
  if (providers.length === 0) {
    return null;
  }

  return (
    <section aria-label={`${label} integrations`} className="space-y-4">
      <SectionHeader title={label} subtitle={description} />
      <div className={WORKSPACE_GRID_INTEGRATIONS_COL}>
        {providers.map((provider) => (
          <IntegrationCard
            key={provider.id}
            provider={provider}
            syncHistory={syncHistory}
            logs={logs}
          />
        ))}
      </div>
    </section>
  );
}
