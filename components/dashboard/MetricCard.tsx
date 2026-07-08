type MetricCardProps = {
  label: string;
  value: string;
};

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
      <p className="text-[11px] font-medium tracking-wide text-white/40 uppercase">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}

export type Metric = MetricCardProps;

export function MetricGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} label={metric.label} value={metric.value} />
      ))}
    </div>
  );
}
