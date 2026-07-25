import { Badge } from "@/components/common/Badge";
import type { CredentialStatus } from "@/lib/integrations/types";
import { cn } from "@/lib/utils";

type CredentialStatusProps = {
  status: CredentialStatus;
  authType: string;
  tokenExpiresAt?: string;
  className?: string;
};

const STATUS_COPY: Record<CredentialStatus, string> = {
  configured: "Configured",
  missing: "Missing",
  expiring: "Expiring Soon",
  "not-required": "Not Required",
};

const STATUS_CLASS: Record<CredentialStatus, string> = {
  configured: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  missing: "border-red-400/20 bg-red-400/10 text-red-300",
  expiring: "border-orion-gold/20 bg-orion-gold/10 text-orion-gold",
  "not-required": "border-white/10 bg-white/[0.03] text-white/45",
};

/** Shows credential readiness and upcoming token expiration. */
export function CredentialStatus({
  status,
  authType,
  tokenExpiresAt,
  className,
}: CredentialStatusProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium tracking-wide text-white/35 uppercase">
          Authentication
        </span>
        <Badge className={cn("normal-case tracking-normal", STATUS_CLASS[status])}>
          {STATUS_COPY[status]}
        </Badge>
      </div>
      <p className="text-sm font-light text-white/55">{authType}</p>
      {tokenExpiresAt ? (
        <p className="text-xs text-orion-gold/80">
          Token expires {new Date(tokenExpiresAt).toLocaleString("en-IN")}
        </p>
      ) : null}
    </div>
  );
}
