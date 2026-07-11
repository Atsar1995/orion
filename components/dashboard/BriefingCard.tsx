import { Badge } from "@/components/common/Badge";
import { SparkIcon } from "@/components/common/icons";
import { Card } from "@/components/ui/Card";

export function BriefingCard() {
  return (
    <Card
      title="Today's Briefing"
      action={
        <Badge>
          <SparkIcon className="h-3 w-3" />
          AI
        </Badge>
      }
    >
      <p className="text-sm leading-relaxed font-light text-white/50">
        AI summary coming soon.
      </p>
    </Card>
  );
}
