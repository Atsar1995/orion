import { Badge } from "@/components/common/Badge";
import type { ProviderCapability } from "@/types/providers";
import { cn } from "@/lib/utils";

type ProviderMetricsProps = {
  capabilities: ProviderCapability[];
  version: string;
  providerType: string;
  className?: string;
};

/** Displays provider capabilities, version, and implementation type. */
export function ProviderMetrics({
  capabilities,
  version,
  providerType,
  className,
}: ProviderMetricsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-orion-md border border-white/[0.05] bg-white/[0.02] px-3 py-2">
          <p className="text-[10px] tracking-wide text-white/35 uppercase">Version</p>
          <p className="mt-1 text-sm font-medium text-white/80">{version}</p>
        </div>
        <div className="rounded-orion-md border border-white/[0.05] bg-white/[0.02] px-3 py-2">
          <p className="text-[10px] tracking-wide text-white/35 uppercase">Type</p>
          <p className="mt-1 text-sm font-medium text-white/80">{providerType}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-medium tracking-wide text-white/35 uppercase">
          Capabilities
        </p>
        {capabilities.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {capabilities.map((capability) => (
              <Badge
                key={capability}
                className="normal-case tracking-normal border-orion-gold/15 bg-orion-gold/5 text-orion-gold/90"
              >
                {capability}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm font-light text-white/45">No capabilities registered.</p>
        )}
      </div>
    </div>
  );
}
