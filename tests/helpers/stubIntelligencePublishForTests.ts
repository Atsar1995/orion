import { vi } from "vitest";
import { createIntelligenceEvent } from "@/lib/platform/intelligence/IntelligenceEventFactory";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { PublishIntelligenceEventInput } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";

let publishSpy: ReturnType<typeof vi.spyOn> | null = null;

/**
 * Bypasses durable IIL transport deduplication for finance domain unit tests.
 * Finance lifecycle methods emit multiple stage events for the same entity;
 * those tests validate finance behaviour, not transport idempotency.
 */
export function stubIntelligencePublishForTests(): void {
  restoreIntelligencePublishForTests();

  const service = getIntelligenceIntegrationService();
  publishSpy = vi.spyOn(service, "publish").mockImplementation(
    (input: PublishIntelligenceEventInput, context: ServiceContext) =>
      createIntelligenceEvent(input, context),
  );
}

/** Restores the real IIL publish implementation after a stubbed test. */
export function restoreIntelligencePublishForTests(): void {
  publishSpy?.mockRestore();
  publishSpy = null;
}

function normalizeTestPath(filePath: string): string {
  return filePath.replace(/\\/g, "/").toLowerCase();
}

/** Finance domain unit tests — not IIL integration tests. */
export function isFinanceDomainUnitTestPath(filePath: string): boolean {
  const normalized = normalizeTestPath(filePath);

  if (!normalized.includes("/tests/lib/finance/")) {
    return false;
  }

  return !normalized.endsWith("/financeeventconsumer.test.ts");
}

/** Integration tests that require the real durable IIL transport. */
export function requiresRealIILTransport(filePath: string): boolean {
  const normalized = normalizeTestPath(filePath);

  return (
    normalized.includes("/financeeventconsumer.test.ts") ||
    normalized.includes("/financega001certification.test.ts") ||
    normalized.includes("/hcmcanonicalpublisher.test.ts") ||
    normalized.includes("/tests/platform/iil/")
  );
}

/** Finance domain unit tests that should bypass transport deduplication. */
export function shouldStubIntelligencePublishForTests(filePath: string): boolean {
  return isFinanceDomainUnitTestPath(filePath);
}
