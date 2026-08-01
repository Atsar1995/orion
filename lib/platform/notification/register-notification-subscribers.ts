import type { IntelligenceIntegrationService } from "@/lib/platform/intelligence/IntelligenceIntegrationService";

const initializedServices = new WeakSet<IntelligenceIntegrationService>();

/** Registers notification inbound event handlers (Mission P-010.3). */
export function registerNotificationSubscribers(_service: IntelligenceIntegrationService): void {
  if (initializedServices.has(_service)) return;
  initializedServices.add(_service);
}
