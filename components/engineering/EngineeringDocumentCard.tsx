import { Card } from "@/components/ui/Card";

type EngineeringDocumentCardProps = {
  title: string;
  path: string;
};

/** Blueprint document card with static path reference. */
export function EngineeringDocumentCard({
  title,
  path,
}: EngineeringDocumentCardProps) {
  return (
    <Card title={title}>
      <div className="flex min-h-[72px] flex-col justify-between gap-3">
        <p className="font-mono text-xs font-light text-white/40">{path}</p>
        <p className="text-sm font-light text-white/55">Blueprint document</p>
      </div>
    </Card>
  );
}
