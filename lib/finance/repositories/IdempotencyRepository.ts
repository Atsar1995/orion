/** Idempotency tracking contract — prevents duplicate event processing (Mission P-009.1). */
export type IdempotencyRepository = {
  exists(organizationId: string, idempotencyKey: string): boolean;
  markProcessed(organizationId: string, idempotencyKey: string, metadata?: Record<string, string>): void;
};
