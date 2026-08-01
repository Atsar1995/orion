import { register } from "@/lib/intelligence/provider-registry";
import { crmExecutiveProvider } from "@/lib/intelligence/workspace-providers/crm-executive-provider";
import { financeExecutiveProvider } from "@/lib/intelligence/workspace-providers/finance-executive-provider";
import { hospitalityExecutiveProvider } from "@/lib/hospitality/providers/hospitality-executive-provider";

/** Registers all platform Executive Intelligence Providers (ADR-006). */
export function registerExecutiveProviders(): void {
  register(financeExecutiveProvider);
  register(crmExecutiveProvider);
  register(hospitalityExecutiveProvider);
}

registerExecutiveProviders();
