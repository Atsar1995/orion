import type { FinanceEventConsumer } from "@/lib/finance/integration/FinanceEventConsumer";
import type { FinanceInboundProcessor } from "@/lib/finance/integration/FinanceInboundProcessor";

let inboundProcessor: FinanceInboundProcessor | null = null;
let eventConsumer: FinanceEventConsumer | null = null;

/** Registers the active Finance inbound processor for IIL consumers. */
export function setFinanceInboundProcessor(processor: FinanceInboundProcessor): void {
  inboundProcessor = processor;
}

/** Returns the active Finance inbound processor. */
export function getFinanceInboundProcessor(): FinanceInboundProcessor {
  if (!inboundProcessor) {
    throw new Error("Finance inbound processor is not initialized");
  }

  return inboundProcessor;
}

/** Registers the active Finance event consumer for IIL wiring. */
export function setFinanceEventConsumer(consumer: FinanceEventConsumer): void {
  eventConsumer = consumer;
}

/** Returns the active Finance event consumer. */
export function getFinanceEventConsumer(): FinanceEventConsumer {
  if (!eventConsumer) {
    throw new Error("Finance event consumer is not initialized");
  }

  return eventConsumer;
}

/** Clears registry state — test isolation only. */
export function resetFinanceIntegrationForTests(): void {
  inboundProcessor = null;
  eventConsumer = null;
}
