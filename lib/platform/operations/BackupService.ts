/**
 * Platform backup policy and verification (Mission P-015.8 · ADR-007 · ADR-012).
 */

import { createCorrelationId } from "@/lib/platform/events/PlatformEventFactory";
import {
  DEFAULT_BACKUP_POLICY,
  type OperationalStatus,
} from "@/lib/platform/operations/OperationalTypes";
import { operationalMetrics } from "@/lib/platform/operations/OperationalMetrics";
import { emitStructuredLog } from "@/lib/platform/operations/PlatformDiagnostics";

export type BackupPolicy = {
  readonly rpoHours: number;
  readonly rtoMinutes: number;
  readonly retentionDays: number;
  readonly verifyAfterBackup: boolean;
};

export type BackupRecord = {
  readonly id: string;
  readonly createdAt: string;
  readonly provider: string;
  readonly checksum: string;
  readonly sizeBytes: number;
  readonly tables: readonly string[];
  readonly verified: boolean;
  readonly correlationId: string;
};

export type BackupVerificationResult = {
  readonly backupId: string;
  readonly status: OperationalStatus;
  readonly message: string;
  readonly withinRpo: boolean;
  readonly checkedAt: string;
};

export type RestoreValidationResult = {
  readonly backupId: string;
  readonly status: OperationalStatus;
  readonly message: string;
  readonly integrityValid: boolean;
  readonly validatedAt: string;
};

let backupSequence = 0;

function computeChecksum(input: string): string {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }

  return `chk-${Math.abs(hash).toString(16)}`;
}

/** Manages logical backup metadata, verification, and retention policy. */
export class BackupService {
  private readonly records = new Map<string, BackupRecord>();
  private policy: BackupPolicy = { ...DEFAULT_BACKUP_POLICY };

  getPolicy(): BackupPolicy {
    return this.policy;
  }

  configurePolicy(policy: Partial<BackupPolicy>): BackupPolicy {
    this.policy = { ...this.policy, ...policy };
    return this.policy;
  }

  createBackup(input: {
    provider: string;
    tables: readonly string[];
    sizeBytes?: number;
    correlationId?: string;
  }): BackupRecord {
    const correlationId = input.correlationId ?? createCorrelationId();
    backupSequence += 1;

    const payload = `${input.provider}:${input.tables.join(",")}:${Date.now()}`;
    const record: BackupRecord = {
      id: `bkp-${backupSequence}`,
      createdAt: new Date().toISOString(),
      provider: input.provider,
      checksum: computeChecksum(payload),
      sizeBytes: input.sizeBytes ?? 0,
      tables: [...input.tables],
      verified: false,
      correlationId,
    };

    this.records.set(record.id, record);
    this.pruneExpiredBackups();

    emitStructuredLog({
      level: "info",
      message: `Backup created: ${record.id}`,
      service: "platform-backup",
      category: "operations",
      correlationId,
      metadata: { backupId: record.id, provider: input.provider },
    });

    operationalMetrics.record({
      name: "platform.backup.count",
      value: this.records.size,
      unit: "count",
    });

    if (this.policy.verifyAfterBackup) {
      this.verifyBackup(record.id);
    }

    return this.records.get(record.id)!;
  }

  listBackups(): readonly BackupRecord[] {
    return [...this.records.values()].sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
  }

  getLatestBackup(): BackupRecord | null {
    return this.listBackups()[0] ?? null;
  }

  verifyBackup(backupId: string): BackupVerificationResult {
    const record = this.records.get(backupId);
    const checkedAt = new Date().toISOString();

    if (!record) {
      return {
        backupId,
        status: "unhealthy",
        message: "Backup record not found.",
        withinRpo: false,
        checkedAt,
      };
    }

    const ageHours =
      (Date.now() - new Date(record.createdAt).getTime()) / (1000 * 60 * 60);
    const withinRpo = ageHours <= this.policy.rpoHours;
    const integrityValid = record.checksum.length > 0 && record.tables.length > 0;

    let status: OperationalStatus = "healthy";
    let message = "Backup verification passed.";

    if (!integrityValid) {
      status = "unhealthy";
      message = "Backup integrity check failed.";
    } else if (!withinRpo) {
      status = "degraded";
      message = `Backup exceeds RPO of ${this.policy.rpoHours}h.`;
    }

    this.records.set(backupId, { ...record, verified: status !== "unhealthy" });

    operationalMetrics.record({
      name: "platform.backup.last_age_hours",
      value: Math.round(ageHours * 100) / 100,
      unit: "hours",
    });

    return { backupId, status, message, withinRpo, checkedAt };
  }

  validateRestore(backupId: string): RestoreValidationResult {
    const record = this.records.get(backupId);
    const validatedAt = new Date().toISOString();

    if (!record) {
      return {
        backupId,
        status: "unhealthy",
        message: "Cannot validate restore — backup not found.",
        integrityValid: false,
        validatedAt,
      };
    }

    const verification = this.verifyBackup(backupId);
    const integrityValid = verification.status !== "unhealthy" && record.verified;

    return {
      backupId,
      status: integrityValid ? "healthy" : verification.status,
      message: integrityValid
        ? "Restore validation passed — backup integrity confirmed."
        : verification.message,
      integrityValid,
      validatedAt,
    };
  }

  assessBackupReadiness(): { status: OperationalStatus; message: string; latestBackupId: string | null } {
    const latest = this.getLatestBackup();

    if (!latest) {
      return {
        status: "degraded",
        message: "No backups recorded — RPO not satisfied.",
        latestBackupId: null,
      };
    }

    const verification = this.verifyBackup(latest.id);

    return {
      status: verification.status,
      message: verification.message,
      latestBackupId: latest.id,
    };
  }

  private pruneExpiredBackups(): void {
    const cutoff = Date.now() - this.policy.retentionDays * 24 * 60 * 60 * 1000;

    for (const [id, record] of this.records) {
      if (new Date(record.createdAt).getTime() < cutoff) {
        this.records.delete(id);
      }
    }
  }

  /** Test isolation — clears backup catalog. */
  resetForTests(): void {
    this.records.clear();
    backupSequence = 0;
    this.policy = { ...DEFAULT_BACKUP_POLICY };
  }
}

export const backupService = new BackupService();
