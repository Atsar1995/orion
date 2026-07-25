import type { ExecutiveBrief } from "@/types/intelligence";
import { ExecutiveCard } from "@/components/dashboard/ExecutiveCard";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";

type BriefCardProps = {
  brief: ExecutiveBrief;
};

/** Executive Brief widget — narrative summary for the dashboard. */
export function BriefCard({ brief }: BriefCardProps) {
  return (
    <ExecutiveCard title={brief.headline} variant="premium">
      <p className={WORKSPACE_SUMMARY_CLASS}>{brief.body}</p>
    </ExecutiveCard>
  );
}
