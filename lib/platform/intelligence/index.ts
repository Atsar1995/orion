export { IntelligenceIntegrationService, defaultIntelligenceIntegrationService } from "@/lib/platform/intelligence/IntelligenceIntegrationService";
export { SubscriptionManager } from "@/lib/platform/intelligence/SubscriptionManager";
export { EventRouter } from "@/lib/platform/intelligence/EventRouter";
export { MessageQueue } from "@/lib/platform/intelligence/MessageQueue";
export { EventReplayStore } from "@/lib/platform/intelligence/EventReplayStore";
export { DeadLetterQueue } from "@/lib/platform/intelligence/DeadLetterQueue";
export { RetryManager, defaultRetryManager } from "@/lib/platform/intelligence/RetryManager";
export { WebhookGateway, defaultWebhookGateway } from "@/lib/platform/intelligence/WebhookGateway";
export { HealthMonitor, defaultHealthMonitor } from "@/lib/platform/intelligence/HealthMonitor";
export { ServiceRegistry, defaultServiceRegistry } from "@/lib/platform/intelligence/ServiceRegistry";
export {
  createIntelligenceEvent,
  intelligenceEventToPlatformEvent,
} from "@/lib/platform/intelligence/IntelligenceEventFactory";
export { registerIntelligenceHandlers } from "@/lib/platform/intelligence/register-intelligence-handlers";

import {
  defaultIntelligenceIntegrationService,
  IntelligenceIntegrationService,
} from "@/lib/platform/intelligence/IntelligenceIntegrationService";
import { registerIntelligenceHandlers } from "@/lib/platform/intelligence/register-intelligence-handlers";

let handlersRegistered = false;

/** Returns the default IIL service with handlers registered once. */
export function getIntelligenceIntegrationService(): IntelligenceIntegrationService {
  if (!handlersRegistered) {
    registerIntelligenceHandlers(defaultIntelligenceIntegrationService);
    handlersRegistered = true;
  }

  return defaultIntelligenceIntegrationService;
}
