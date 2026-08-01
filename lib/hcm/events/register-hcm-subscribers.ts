import { HCM_IIL_SERVICE_ID } from "@/lib/hcm/constants";
import { hcmWorkflowOrchestrator } from "@/lib/hcm/workflow/HcmWorkflowOrchestrator";
import type { IntelligenceIntegrationService } from "@/lib/platform/intelligence/IntelligenceIntegrationService";

const initializedServices = new WeakSet<IntelligenceIntegrationService>();
let hcmSubscriberRegistrationCount = 0;

/** Registers HCM workflow orchestration subscribers on IIL (S-002.6). */
export function registerHcmSubscribers(service: IntelligenceIntegrationService): void {
  if (initializedServices.has(service)) {
    return;
  }

  initializedServices.add(service);
  hcmSubscriberRegistrationCount += 1;

  service.subscribe(
    {
      subscriberId: "workflow-platform",
      eventTypes: ["CustomEvent"],
      priority: 35,
    },
    async (event, context) => {
      if (event.sourceService !== HCM_IIL_SERVICE_ID) {
        return;
      }

      await hcmWorkflowOrchestrator.handle(event, context);
    },
  );
}

export function getHcmSubscriberRegistrationCount(): number {
  return hcmSubscriberRegistrationCount;
}
