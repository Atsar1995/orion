/**
 * ORION Persistence — persistence service layer.
 */

export { OrganizationPersistenceService } from "@/lib/persistence/services/OrganizationPersistenceService";
export { UserPersistenceService } from "@/lib/persistence/services/UserPersistenceService";
export { WorkspacePersistenceService } from "@/lib/persistence/services/WorkspacePersistenceService";

export type {
  AuditRepository,
  ExtendedRepository,
  PersistenceAuditAction,
  PersistenceAuditEntry,
  PersistenceTransaction,
  TransactionManager,
} from "@/lib/persistence/services/shared";

export {
  BasePersistenceService,
  NoOpAuditRepository,
  NoOpTransactionManager,
  validateEmailFormat,
  validateRequiredId,
  validateServiceContext,
  validateSlugFormat,
} from "@/lib/persistence/services/shared";

import {
  InMemoryOrganizationRepository,
  InMemoryUserRepository,
  InMemoryWorkspaceRepository,
} from "@/lib/persistence/memory";
import { OrganizationPersistenceService } from "@/lib/persistence/services/OrganizationPersistenceService";
import { UserPersistenceService } from "@/lib/persistence/services/UserPersistenceService";
import { WorkspacePersistenceService } from "@/lib/persistence/services/WorkspacePersistenceService";
import {
  NoOpAuditRepository,
  NoOpTransactionManager,
} from "@/lib/persistence/services/shared";

/** Creates a user persistence service wired to in-memory adapters. */
export function createInMemoryUserPersistenceService(): UserPersistenceService {
  return new UserPersistenceService(
    new InMemoryUserRepository(),
    new NoOpAuditRepository(),
    new NoOpTransactionManager(),
  );
}

/** Creates an organization persistence service wired to in-memory adapters. */
export function createInMemoryOrganizationPersistenceService(): OrganizationPersistenceService {
  return new OrganizationPersistenceService(
    new InMemoryOrganizationRepository(),
    new NoOpAuditRepository(),
    new NoOpTransactionManager(),
  );
}

/** Creates a workspace persistence service wired to in-memory adapters. */
export function createInMemoryWorkspacePersistenceService(): WorkspacePersistenceService {
  return new WorkspacePersistenceService(
    new InMemoryWorkspaceRepository(),
    new NoOpAuditRepository(),
    new NoOpTransactionManager(),
  );
}
