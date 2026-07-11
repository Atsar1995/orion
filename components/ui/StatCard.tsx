type StatCardProps = {
  label: string;
  value: string;
};

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-orion-md border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
      <p className="text-[11px] font-medium tracking-wide text-white/40 uppercase">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}

export type Stat = StatCardProps;

export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {stats.map((stat) => (
        <StatCard key={stat.label} label={stat.label} value={stat.value} />
      ))}
    </div>
  );
}
