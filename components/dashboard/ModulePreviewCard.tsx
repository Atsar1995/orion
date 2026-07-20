import { Card } from "@/components/ui/Card";

type ModulePreviewCardProps = {
  title: string;
};

/** Business module preview card with coming-soon messaging. */
export function ModulePreviewCard({ title }: ModulePreviewCardProps) {
  return (
    <Card title={title}>
      <div className="flex min-h-[120px] flex-col justify-center space-y-2">
        <p className="text-base font-medium text-white/75">Coming Soon</p>
        <p className="text-sm font-light leading-relaxed text-white/45">
          Future live operational metrics.
        </p>
      </div>
    </Card>
  );
}
