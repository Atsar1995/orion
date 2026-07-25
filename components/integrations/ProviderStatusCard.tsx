import { Badge } from "@/components/common/Badge";
import type { ProviderStatus } from "@/types/providers";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<ProviderStatus, string> = {
  connected: "Connected",
  disconnected: "Disconnected",
  syncing: "Syncing",
  error: "Error",
};

const STATUS_CLASSES: Record<ProviderStatus, string> = {
  connected: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  disconnected: "border-white/10 bg-white/[0.03] text-white/45",
  syncing: "border-orion-gold/20 bg-orion-gold/10 text-orion-gold",
  error: "border-red-400/20 bg-red-400/10 text-red-300",
};

type ProviderStatusCardProps = {
  status: ProviderStatus;
  healthy?: boolean;
  className?: string;
};

/** Compact status badge for provider connection state. */
export function ProviderStatusCard({ status, healthy, className }: ProviderStatusCardProps) {
  const label =
    status === "connected" && healthy === false ? "Degraded" : STATUS_LABELS[status];

  return (
    <Badge className={cn("normal-case tracking-normal", STATUS_CLASSES[status], className)}>
      {label}
    </Badge>
  );
}

export function formatIntegrationTimestamp(value?: string): string {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatAuthType(authType: string): string {
  switch (authType) {
    case "oauth2":
      return "OAuth 2.0";
    case "api-key":
      return "API Key";
    case "service-account":
      return "Service Account";
    default:
      return "Manual";
  }
}

export function formatProviderType(providerType: string): string {
  switch (providerType) {
    case "live":
      return "Live";
    case "mock":
      return "Mock";
    case "plugin":
      return "Plugin";
    default:
      return providerType;
  }
}
