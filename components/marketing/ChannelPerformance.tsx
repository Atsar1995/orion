import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { Card } from "@/components/ui/Card";
import { CHANNEL_PERFORMANCE } from "@/lib/marketing-data";

/** Channel-level marketing performance indicators. */
export function ChannelPerformance() {
  return (
    <Card title="Channel Performance">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CHANNEL_PERFORMANCE.map((channel) => (
          <li
            key={channel.channel}
            className="rounded-orion-md border border-white/[0.05] bg-white/[0.02] px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white/85">{channel.channel}</p>
                <p className="mt-0.5 text-xs font-light text-white/45">
                  {channel.leads} leads · {channel.conversion} conversion
                </p>
              </div>
              <StatusIndicator status={channel.status} />
            </div>
            <p className="mt-2 text-xs font-light leading-relaxed text-white/55">
              {channel.summary}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
