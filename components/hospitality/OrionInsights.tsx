import { Card } from "@/components/ui/Card";
import { WORKSPACE_PREMIUM_BODY_CLASS } from "@/lib/constants";
import { ORION_INSIGHTS } from "@/lib/hospitality-data";

/** AI-style hospitality insights across revenue, guest, and operations. */
export function OrionInsights() {
  return (
    <Card title="ORION Insights" variant="premium">
      <ul className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {ORION_INSIGHTS.map((item) => (
          <li
            key={item.category}
            className="rounded-orion-md border border-orion-gold/10 bg-orion-gold/[0.04] p-4"
          >
            <p className="text-xs font-medium tracking-wide text-orion-gold/80 uppercase">
              {item.category}
            </p>
            <p className={`mt-2 ${WORKSPACE_PREMIUM_BODY_CLASS}`}>{item.insight}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
