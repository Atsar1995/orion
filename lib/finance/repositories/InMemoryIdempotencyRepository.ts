import type { IdempotencyRepository } from "@/lib/finance/repositories/IdempotencyRepository";

/** In-memory idempotency store for validation framework (Mission P-009.1). */
export class InMemoryIdempotencyRepository implements IdempotencyRepository {
  private readonly keys = new Map<string, Record<string, string>>();

  private key(organizationId: string, idempotencyKey: string): string {
    return `${organizationId}::${idempotencyKey}`;
  }

  exists(organizationId: string, idempotencyKey: string): boolean {
    return this.keys.has(this.key(organizationId, idempotencyKey.trim()));
  }

  markProcessed(
    organizationId: string,
    idempotencyKey: string,
    metadata: Record<string, string> = {},
  ): void {
    this.keys.set(this.key(organizationId, idempotencyKey.trim()), metadata);
  }
}

export const defaultIdempotencyRepository = new InMemoryIdempotencyRepository();
