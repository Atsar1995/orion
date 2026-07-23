import { Card } from "@/components/ui/Card";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";
import { WEATHER } from "@/lib/advisor-data";

/** Placeholder weather context for executive planning. */
export function WeatherCard() {
  return (
    <Card title="Weather">
      <div className="space-y-2">
        <p className="text-sm font-medium text-white/85">{WEATHER.location}</p>
        <p className="text-3xl font-semibold tracking-tight text-white">
          {WEATHER.temperature}
        </p>
        <p className="text-sm font-medium text-orion-gold/90">{WEATHER.condition}</p>
        <p className={WORKSPACE_SUMMARY_CLASS}>{WEATHER.summary}</p>
      </div>
    </Card>
  );
}
