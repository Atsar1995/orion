import { Card } from "@/components/ui/Card";
import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { BUSINESS_HEALTH_OVERVIEW } from "@/lib/command-center-data";

/** At-a-glance business health with status indicators. */
export function BusinessHealthOverview() {
  return (
    <Card title="Business Health Overview">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {BUSINESS_HEALTH_OVERVIEW.map((item) => (
          <li
            key={item.module}
            className="flex items-center justify-between gap-4 rounded-orion-md border border-white/[0.05] bg-white/[0.02] px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-white/80">{item.module}</p>
              <p className="mt-0.5 text-xs font-light text-white/45">
                {item.summary}
              </p>
            </div>
            <StatusIndicator status={item.status} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
