import { Card } from "@/components/ui/Card";

/** Latest release summary for the Engineering Workspace. */
export function ReleaseInformationCard() {
  return (
    <Card title="Release Information">
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium tracking-[0.14em] text-white/40 uppercase">
            Latest Release
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-white">
            v0.5 – Command
          </p>
        </div>
        <p className="text-sm font-light leading-relaxed text-white/50">
          Command Center foundation, platform health monitoring, and executive
          briefing surfaces.
        </p>
      </div>
    </Card>
  );
}
