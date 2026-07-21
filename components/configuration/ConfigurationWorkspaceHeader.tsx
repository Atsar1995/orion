import { StatCard } from "@/components/ui/StatCard";
import { CONFIGURATION_SUMMARY } from "@/lib/configuration-data";

/** Configuration Workspace page header with summary context cards. */
export function ConfigurationWorkspaceHeader() {
  return (
    <header className="space-y-4">
      <div className="space-y-2 border-b border-white/[0.06] pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Configuration Workspace
        </h1>
        <p className="text-sm font-light text-white/45">
          Manage platform-wide settings, preferences, and integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {CONFIGURATION_SUMMARY.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>
    </header>
  );
}
