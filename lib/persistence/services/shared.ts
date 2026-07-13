/**
 * ORION Persistence — shared service layer infrastructure.
 */

import type { Entity, RepositoryResult, TenantContext } from "@/types/persistence";
import type { Repository } from "@/lib/persistence/repository";
import { isTenantMismatchError, validationError } from "@/lib/persistence/errors";
import { failure, success } from "@/lib/persistence/result";
import { validateTenantContext } from "@/lib/persistence/tenant-context";

/** Repository contract used by persistence services. */
export interface ExtendedRepository<T extends Entity> extends Repository<T> {
  findAll(context: TenantContext): Promise<RepositoryResult<T[]>>;
  exists(id: string, context: TenantContext): Promise<RepositoryResult<boolean>>;
  count(context: TenantContext): Promise<RepositoryResult<number>>;
}

/** Persistence mutation categories for audit recording. */
export type PersistenceAuditAction = "create" | "update" | "delete" | "tenant_violation";

/** Structured persistence audit entry prepared by services. */
export interface PersistenceAuditEntry {
  action: PersistenceAuditAction;
  entityName: string;
  entityId: string;
  actorUserId: string;
  organizationId: string;
  workspaceId: string;
  recordedAt: Date;
  metadata?: Record<string, string>;
}

/** Placeholder audit repository contract for future persistence adapters. */
export interface AuditRepository {
  record(
    entry: PersistenceAuditEntry,
    context: TenantContext,
  ): Promise<RepositoryResult<void>>;
}

/** Placeholder transaction handle for future unit-of-work support. */
export interface PersistenceTransaction {
  readonly transactionId: string;
}

/** Placeholder transaction manager for future unit-of-work support. */
export interface TransactionManager {
  beginTransaction(): Promise<RepositoryResult<PersistenceTransaction>>;
  commit(transaction: PersistenceTransaction): Promise<RepositoryResult<void>>;
  rollback(transaction: PersistenceTransaction): Promise<RepositoryResult<void>>;
}

/** No-op audit repository placeholder for development and testing. */
export class NoOpAuditRepository implements AuditRepository {
  async record(): Promise<RepositoryResult<void>> {
    return success(undefined);
  }
}

/** No-op transaction manager placeholder for development and testing. */
export class NoOpTransactionManager implements TransactionManager {
  async beginTransaction(): Promise<RepositoryResult<PersistenceTransaction>> {
    return success({
      transactionId: `noop-${Date.now()}`,
    });
  }

  async commit(): Promise<RepositoryResult<void>> {
    return success(undefined);
  }

  async rollback(): Promise<RepositoryResult<void>> {
    return success(undefined);
  }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Validates tenant context at the service boundary. */
export function validateServiceContext(
  context: TenantContext,
): RepositoryResult<TenantContext> {
  return validateTenantContext(context);
}

/** Validates a required non-empty identifier. */
export function validateRequiredId(
  id: string,
  entityName: string,
): RepositoryResult<string> {
  if (typeof id !== "string" || id.trim().length === 0) {
    return failure(
      validationError({
        message: `${entityName} id is required.`,
      }),
    );
  }

  return success(id.trim());
}

/** Validates an email address format. */
export function validateEmailFormat(email: string): RepositoryResult<string> {
  const normalized = email.trim();

  if (!normalized || !EMAIL_PATTERN.test(normalized)) {
    return failure(
      validationError({
        message: "A valid email address is required.",
      }),
    );
  }

  return success(normalized);
}

/** Validates a URL-safe slug format. */
export function validateSlugFormat(slug: string): RepositoryResult<string> {
  const normalized = slug.trim().toLowerCase();

  if (!normalized || !SLUG_PATTERN.test(normalized)) {
    return failure(
      validationError({
        message: "Slug must contain lowercase letters, numbers, and hyphens only.",
      }),
    );
  }

  return success(normalized);
}

/** Base persistence service coordinating repositories, audit, and transactions. */
export abstract class BasePersistenceService<T extends Entity> {
  protected abstract readonly entityName: string;

  constructor(
    protected readonly repository: ExtendedRepository<T>,
    protected readonly auditRepository: AuditRepository,
    protected readonly transactionManager: TransactionManager,
  ) {}

  protected validateContext(
    context: TenantContext,
  ): RepositoryResult<TenantContext> {
    return validateServiceContext(context);
  }

  protected async recordAudit(
    entry: Omit<PersistenceAuditEntry, "recordedAt">,
    context: TenantContext,
  ): Promise<RepositoryResult<void>> {
    return this.auditRepository.record(
      {
        ...entry,
        recordedAt: new Date(),
      },
      context,
    );
  }

  protected async recordTenantViolation(
    entityId: string,
    context: TenantContext,
    message: string,
  ): Promise<void> {
    await this.recordAudit(
      {
        action: "tenant_violation",
        entityName: this.entityName,
        entityId,
        actorUserId: context.userId,
        organizationId: context.organizationId,
        workspaceId: context.workspaceId,
        metadata: { message },
      },
      context,
    );
  }

  protected async executeRead<R>(
    context: TenantContext,
    operation: () => Promise<RepositoryResult<R>>,
  ): Promise<RepositoryResult<R>> {
    const contextResult = this.validateContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    return operation();
  }

  protected async executeWrite<R>(
    context: TenantContext,
    operation: () => Promise<RepositoryResult<R>>,
    audit?: Omit<PersistenceAuditEntry, "recordedAt" | "actorUserId" | "organizationId" | "workspaceId" | "entityName">,
  ): Promise<RepositoryResult<R>> {
    const contextResult = this.validateContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    const transactionResult = await this.transactionManager.beginTransaction();

    if (!transactionResult.success) {
      return transactionResult;
    }

    const operationResult = await operation();

    if (!operationResult.success) {
      await this.transactionManager.rollback(transactionResult.data);

      if (isTenantMismatchError(operationResult.error)) {
        await this.recordTenantViolation(
          audit?.entityId ?? "unknown",
          context,
          operationResult.error.message,
        );
      }

      return operationResult;
    }

    const commitResult = await this.transactionManager.commit(
      transactionResult.data,
    );

    if (!commitResult.success) {
      return commitResult;
    }

    if (audit) {
      const auditResult = await this.recordAudit(
        {
          ...audit,
          entityName: this.entityName,
          actorUserId: context.userId,
          organizationId: context.organizationId,
          workspaceId: context.workspaceId,
        },
        context,
      );

      if (!auditResult.success) {
        return auditResult;
      }
    }

    return operationResult;
  }
}
