import { StatCard } from "@/components/ui/StatCard";
import { CONFIGURATION_SUMMARY } from "@/lib/configuration-data";
import {
  WORKSPACE_HEADER_BLOCK_CLASS,
  WORKSPACE_STAT_GRID_CLASS,
  WORKSPACE_SUBTITLE_CLASS,
  WORKSPACE_TITLE_CLASS,
} from "@/lib/constants";

/** Configuration Workspace page header with summary context cards. */
export function ConfigurationWorkspaceHeader() {
  return (
    <header className="space-y-4">
      <div className={WORKSPACE_HEADER_BLOCK_CLASS}>
        <h1 className={WORKSPACE_TITLE_CLASS}>Configuration Workspace</h1>
        <p className={WORKSPACE_SUBTITLE_CLASS}>
          Manage platform-wide settings, preferences, and integrations.
        </p>
      </div>

      <div className={WORKSPACE_STAT_GRID_CLASS}>
        {CONFIGURATION_SUMMARY.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>
    </header>
  );
}
