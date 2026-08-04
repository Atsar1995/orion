import { resetDefaultCrmBackingForTests } from "@/lib/crm/persistence/createCrmStore";
import { resetCrmEventPipelineRegistryForTests } from "@/lib/crm/services/crmEventPipelineRegistry";
import { resetFinanceEventConsumerForTests } from "@/lib/finance/integration/FinanceEventConsumer";
import { resetFinanceIntegrationForTests } from "@/lib/finance/integration/financeIntegrationRegistry";
import { resetIntelligenceIntegrationForTests } from "@/lib/platform/intelligence";
import { resetDefaultPlatformStoreForTests } from "@/lib/platform/store/PlatformStoreFactory";

/**
 * Resets shared platform integration singletons — test isolation only (P-009.17A).
 *
 * Clears durable IIL transport state (events, idempotency cache, DLQ, metrics),
 * the default IntelligenceIntegrationService, handler registration guards,
 * PlatformStore defaults, and Finance integration registries.
 */
export function resetPlatformIntegrationStateForTests(): void {
  resetIntelligenceIntegrationForTests();
  resetDefaultPlatformStoreForTests();
  resetDefaultCrmBackingForTests();
  resetCrmEventPipelineRegistryForTests();
  resetFinanceIntegrationForTests();
  resetFinanceEventConsumerForTests();
}
