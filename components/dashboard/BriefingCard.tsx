import { Card } from "@/components/ui/Card";

/** Static executive briefing for the Command Center. */
export function BriefingCard() {
  return (
    <Card title="Today's Executive Briefing">
      <div className="space-y-3 text-sm leading-relaxed">
        <p className="font-medium text-white/80">Platform healthy.</p>
        <p className="font-light text-white/55">
          No critical engineering alerts.
        </p>
        <p className="font-light text-white/55">Continue Sprint 11E.</p>
        <div className="pt-1">
          <p className="text-xs font-medium tracking-[0.14em] text-white/40 uppercase">
            Next milestone
          </p>
          <p className="mt-1 font-medium text-white/70">Engineering Workspace.</p>
        </div>
      </div>
    </Card>
  );
}
