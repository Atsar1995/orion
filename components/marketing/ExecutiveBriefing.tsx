import { Card } from "@/components/ui/Card";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";
import { EXECUTIVE_BRIEFING } from "@/lib/marketing-data";

/** Natural-language executive marketing briefing. */
export function ExecutiveBriefing() {
  return (
    <Card title="Executive Briefing" variant="premium">
      <p className={WORKSPACE_SUMMARY_CLASS}>{EXECUTIVE_BRIEFING}</p>
    </Card>
  );
}
