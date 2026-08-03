import type { PersistenceTransaction } from "@/lib/persistence/services/shared";
import type { PostingContext } from "@/lib/finance/services/PostingContext";

/** Active posting unit-of-work handle (P-009.7C). */
export type PostingTransaction = {
  readonly persistenceTransaction: PersistenceTransaction;
  readonly context: PostingContext;
  readonly lineageId: string;
};
