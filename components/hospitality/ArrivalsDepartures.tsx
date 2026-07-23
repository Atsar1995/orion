import { Card } from "@/components/ui/Card";
import { ARRIVALS_DEPARTURES } from "@/lib/hospitality-data";

/** Today's arrivals and departures schedule. */
export function ArrivalsDepartures() {
  const arrivals = ARRIVALS_DEPARTURES.filter((item) => item.type === "arrival");
  const departures = ARRIVALS_DEPARTURES.filter((item) => item.type === "departure");

  return (
    <Card title="Arrivals & Departures">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-medium tracking-wide text-white/40 uppercase">
            Arrivals
          </p>
          <ul className="space-y-2.5">
            {arrivals.map((item) => (
              <li
                key={`${item.guest}-${item.room}`}
                className="flex items-center justify-between gap-4 rounded-orion-md border border-white/[0.05] bg-white/[0.02] px-4 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-white/85">{item.guest}</p>
                  <p className="text-xs font-light text-white/45">Room {item.room}</p>
                </div>
                <span className="text-xs font-medium tabular-nums text-orion-gold/90">
                  {item.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-xs font-medium tracking-wide text-white/40 uppercase">
            Departures
          </p>
          <ul className="space-y-2.5">
            {departures.map((item) => (
              <li
                key={`${item.guest}-${item.room}`}
                className="flex items-center justify-between gap-4 rounded-orion-md border border-white/[0.05] bg-white/[0.02] px-4 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-white/85">{item.guest}</p>
                  <p className="text-xs font-light text-white/45">Room {item.room}</p>
                </div>
                <span className="text-xs font-medium tabular-nums text-white/50">
                  {item.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
