import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/ui/Card";

/** Active engineering specification for the current development cycle. */
export function CurrentSpecificationCard() {
  return (
    <Card title="Current Engineering Specification" variant="premium">
      <div className="space-y-3">
        <Badge className="normal-case tracking-normal">Active</Badge>
        <p className="text-base font-medium text-white/85">
          ES-012C – Engineering Workspace MVP
        </p>
        <p className="text-sm font-light leading-relaxed text-white/50">
          Dedicated engineering workspace with status, documents, specifications,
          and release context.
        </p>
      </div>
    </Card>
  );
}
