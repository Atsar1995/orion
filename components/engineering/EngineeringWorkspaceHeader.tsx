import { StatCard } from "@/components/ui/StatCard";

const ENGINEERING_VERSION = "v0.5 – Command";
const CURRENT_SPECIFICATION = "ES-012D";
const CURRENT_BRANCH = "main";

const HEADER_STATS = [
  { label: "Current Specification", value: CURRENT_SPECIFICATION },
  { label: "Current Version", value: ENGINEERING_VERSION },
  { label: "Current Branch", value: CURRENT_BRANCH },
] as const;

/** Engineering Workspace page header with sprint, version, and branch context. */
export function EngineeringWorkspaceHeader() {
  return (
    <header className="space-y-4">
      <div className="space-y-2 border-b border-white/[0.06] pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Engineering Workspace
        </h1>
        <p className="text-sm font-light text-white/45">Engineering Integration</p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {HEADER_STATS.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>
    </header>
  );
}
