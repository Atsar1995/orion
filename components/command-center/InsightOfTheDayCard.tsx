import { SparkIcon } from "@/components/common/icons";
import { Card } from "@/components/ui/Card";
import { INSIGHT_OF_THE_DAY } from "@/lib/command-center-data";

/** Featured daily insight for executive decision-making. */
export function InsightOfTheDayCard() {
  return (
    <Card title="ORION Insight of the Day" variant="premium">
      <div className="flex gap-4">
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-orion-md border border-orion-gold/25 bg-orion-gold/10">
          <SparkIcon className="h-4 w-4 text-orion-gold" />
        </div>
        <p className="text-sm font-light leading-relaxed text-white/70">
          {INSIGHT_OF_THE_DAY}
        </p>
      </div>
    </Card>
  );
}
