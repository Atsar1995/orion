import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { WORKSPACE_LIST_CLASS, WORKSPACE_LIST_ITEM_CLASS } from "@/lib/constants";
import { GUEST_EXPERIENCE } from "@/lib/hospitality-data";

/** Guest satisfaction, reviews, and pending requests. */
export function GuestExperience() {
  return (
    <Card title="Guest Experience">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          <StatCard
            label="Positive Reviews"
            value={String(GUEST_EXPERIENCE.positiveReviews)}
          />
          <StatCard label="Complaints" value={String(GUEST_EXPERIENCE.complaints)} />
          <StatCard
            label="Pending Requests"
            value={String(GUEST_EXPERIENCE.pendingRequests)}
          />
          <StatCard
            label="Satisfaction Trend"
            value={GUEST_EXPERIENCE.satisfactionTrend}
          />
        </div>
        <ul className={WORKSPACE_LIST_CLASS}>
          {GUEST_EXPERIENCE.highlights.map((item) => (
            <li key={item} className={WORKSPACE_LIST_ITEM_CLASS}>
              <span aria-hidden className="text-orion-gold/70">
                •
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
