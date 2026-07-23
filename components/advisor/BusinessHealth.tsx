import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { Card } from "@/components/ui/Card";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";
import { BUSINESS_HEALTH } from "@/lib/advisor-data";

/** Overall business health score and executive explanation. */
export function BusinessHealth() {
  return (
    <Card title="Business Health" variant="premium">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <StatusIndicator status={BUSINESS_HEALTH.status} />
          <div className="text-right">
            <p className="text-xs font-medium tracking-wide text-white/40 uppercase">
              Health Score
            </p>
            <p className="text-3xl font-semibold tracking-tight text-white">
              {BUSINESS_HEALTH.score}
              <span className="text-lg font-light text-white/45"> / 100</span>
            </p>
          </div>
        </div>
        <p className={WORKSPACE_SUMMARY_CLASS}>{BUSINESS_HEALTH.explanation}</p>
      </div>
    </Card>
  );
}
