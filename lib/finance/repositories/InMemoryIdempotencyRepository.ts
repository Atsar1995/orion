import type { IdempotencyRepository } from "@/lib/finance/repositories/IdempotencyRepository";
import type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";
import { getDefaultFinanceBacking } from "@/lib/finance/persistence/createFinanceStore";

/** In-memory idempotency store for validation framework (Mission P-009.1). */
export class InMemoryIdempotencyRepository implements IdempotencyRepository {
  constructor(private readonly backing: FinanceStoreBacking) {}

  private key(organizationId: string, idempotencyKey: string): string {
    return `${organizationId}::${idempotencyKey}`;
  }

  exists(organizationId: string, idempotencyKey: string): boolean {
    return this.backing.idempotencyKeys.has(this.key(organizationId, idempotencyKey.trim()));
  }

  markProcessed(
    organizationId: string,
    idempotencyKey: string,
    metadata: Record<string, string> = {},
  ): void {
    this.backing.idempotencyKeys.set(this.key(organizationId, idempotencyKey.trim()), metadata);
  }
}

export const defaultIdempotencyRepository = new InMemoryIdempotencyRepository(
  getDefaultFinanceBacking(),
);
