import { Card } from "@/components/ui/Card";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";
import { EXECUTIVE_BRIEFING } from "@/lib/hospitality-data";

type ExecutiveBriefingProps = { briefing?: string };

/** Natural-language executive hospitality briefing. */
export function ExecutiveBriefing({ briefing = EXECUTIVE_BRIEFING }: ExecutiveBriefingProps) {
  return (
    <Card title="Executive Briefing" variant="premium">
      <p className={WORKSPACE_SUMMARY_CLASS}>{briefing}</p>
    </Card>
  );
}
