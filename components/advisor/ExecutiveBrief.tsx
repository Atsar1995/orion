import { Card } from "@/components/ui/Card";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";
import { EXECUTIVE_BRIEF } from "@/lib/advisor-data";

/** Natural-language daily executive briefing from ORION Advisor. */
export function ExecutiveBrief() {
  return (
    <Card title="Today's Executive Brief" variant="premium">
      <p className={WORKSPACE_SUMMARY_CLASS}>{EXECUTIVE_BRIEF}</p>
    </Card>
  );
}
