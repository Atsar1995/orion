import type { FinanceEventPipelineFacade } from "@/lib/finance/event-pipeline";

let eventPipelineService: FinanceEventPipelineFacade | null = null;

/** Registers the active Finance event pipeline facade for IIL subscribers. */
export function setFinanceEventPipelineService(service: FinanceEventPipelineFacade): void {
  eventPipelineService = service;
}

/** Returns the active Finance event pipeline facade (composition root must register first). */
export function getFinanceEventPipelineService(): FinanceEventPipelineFacade {
  if (!eventPipelineService) {
    throw new Error("Finance event pipeline service is not initialized");
  }

  return eventPipelineService;
}

/** Clears registry state — test isolation only. */
export function resetFinanceEventPipelineServiceForTests(): void {
  eventPipelineService = null;
}
