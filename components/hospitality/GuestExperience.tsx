import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { WORKSPACE_LIST_CLASS, WORKSPACE_LIST_ITEM_CLASS } from "@/lib/constants";
import { GUEST_EXPERIENCE } from "@/lib/hospitality-data";

type GuestExperienceProps = {
  data?: {
    positiveReviews: number;
    complaints: number;
    pendingRequests: number;
    satisfactionTrend: string;
    highlights: readonly string[];
  };
};

/** Guest satisfaction, reviews, and pending requests. */
export function GuestExperience({ data = GUEST_EXPERIENCE }: GuestExperienceProps) {
  return (
    <Card title="Guest Experience">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          <StatCard label="Positive Reviews" value={String(data.positiveReviews)} />
          <StatCard label="Complaints" value={String(data.complaints)} />
          <StatCard label="Pending Requests" value={String(data.pendingRequests)} />
          <StatCard label="Satisfaction Trend" value={data.satisfactionTrend} />
        </div>
        <ul className={WORKSPACE_LIST_CLASS}>
          {data.highlights.map((item) => (
            <li key={item} className={WORKSPACE_LIST_ITEM_CLASS}>
              <span aria-hidden className="text-orion-gold/70">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
