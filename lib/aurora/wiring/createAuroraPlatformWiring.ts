import { DefaultCircuitBreakerRegistry } from "@/lib/aurora/infrastructure/CircuitBreakerRegistry";
import { InMemoryQueueManager } from "@/lib/aurora/infrastructure/QueueManager";
import { DefaultRetryManager } from "@/lib/aurora/infrastructure/RetryManager";
import { DefaultSchedulerService } from "@/lib/aurora/infrastructure/SchedulerService";
import { DefaultConnectorRegistry } from "@/lib/aurora/integrations/registry/ConnectorRegistry";
import { DefaultConfigurationService } from "@/lib/aurora/platform/services/ConfigurationService";
import type { AuroraWiringConfig } from "@/lib/aurora/wiring/AuroraWiring";
import { createAuroraPersistenceWiring } from "@/lib/aurora/wiring/createAuroraPersistenceWiring";
import { EventBus } from "@/lib/platform/events/EventBus";
import { DefaultAuroraEventPublisher } from "@/lib/aurora/events/AuroraEventPublisher";

export function createAuroraPlatformWiring(config: AuroraWiringConfig) {
  const persistence = createAuroraPersistenceWiring(config);
  const retryManager = new DefaultRetryManager();
  const circuitBreakerRegistry = new DefaultCircuitBreakerRegistry();
  const eventPublisher = new DefaultAuroraEventPublisher(config.eventBus ?? new EventBus());
  const connectorRegistry = new DefaultConnectorRegistry();
  const queueManager = new InMemoryQueueManager(retryManager);
  const scheduler = new DefaultSchedulerService(queueManager, persistence.repositories.schedule);
  const configurationService = new DefaultConfigurationService(config, persistence.backing);

  return {
    ...persistence,
    retryManager,
    circuitBreakerRegistry,
    eventPublisher,
    connectorRegistry,
    queueManager,
    scheduler,
    configurationService,
  };
}
