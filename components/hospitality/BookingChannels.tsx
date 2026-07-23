import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { Card } from "@/components/ui/Card";
import { BOOKING_CHANNELS } from "@/lib/hospitality-data";

/** Booking channel performance and mix. */
export function BookingChannels() {
  return (
    <Card title="Booking Channels">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {BOOKING_CHANNELS.map((channel) => (
          <li
            key={channel.channel}
            className="rounded-orion-md border border-white/[0.05] bg-white/[0.02] px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white/85">{channel.channel}</p>
                <p className="mt-0.5 text-xs font-light text-white/45">
                  {channel.bookings} bookings · {channel.share} of total
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
