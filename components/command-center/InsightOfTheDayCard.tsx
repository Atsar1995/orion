import { SparkIcon } from "@/components/common/icons";
import { Card } from "@/components/ui/Card";
import { INSIGHT_OF_THE_DAY } from "@/lib/command-center-data";
import {
  WORKSPACE_PREMIUM_BODY_CLASS,
  WORKSPACE_PREMIUM_ICON_CLASS,
} from "@/lib/constants";

/** Featured daily insight for executive decision-making. */
export function InsightOfTheDayCard() {
  return (
    <Card title="ORION Insight of the Day" variant="premium">
      <div className="flex gap-4">
        <div className={WORKSPACE_PREMIUM_ICON_CLASS}>
          <SparkIcon className="h-5 w-5 text-orion-gold" />
        </div>
        <p className={WORKSPACE_PREMIUM_BODY_CLASS}>{INSIGHT_OF_THE_DAY}</p>
      </div>
    </Card>
  );
}
