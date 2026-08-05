/**
 * Shared Procurement business service utilities (Mission P-010.7).
 */

import type { ProcurementAggregateRecord } from "@/lib/procurement/persistence/ProcurementStoreBacking";
import type { ProcurementPersistenceRepository } from "@/lib/procurement/persistence/ProcurementPersistenceRepository";
import { AuthorizationError } from "@/lib/platform/security/AuthorizationResult";
import type { PermissionCode } from "@/lib/platform/security/Permission";
import type { ProcurementAuthorizationService } from "@/lib/procurement/security/ProcurementAuthorizationService";
import type { VendorRecord } from "@/lib/procurement/types/supplier";
import type { ServiceContext } from "@/types/services";

export function nowIso(): string {
  return new Date().toISOString();
}

export function asVendorRecord(record: ProcurementAggregateRecord): VendorRecord {
  return record as VendorRecord;
}

export function getVendorOrThrow(
  repository: ProcurementPersistenceRepository,
  vendorId: string,
  context: ServiceContext,
): VendorRecord {
  const record = repository.getById(context.organizationId, "vendors", vendorId);
  if (!record) {
    throw new Error("VENDOR_NOT_FOUND");
  }
  return asVendorRecord(record);
}

export function assertUniqueVendorCode(
  repository: ProcurementPersistenceRepository,
  organizationId: string,
  vendorCode: string,
  excludeVendorId?: string,
): void {
  const normalized = vendorCode.trim().toUpperCase();
  if (!normalized) {
    throw new Error("INVALID_VENDOR_CODE");
  }

  const duplicate = repository
    .listByOrganization(organizationId, "vendors")
    .map(asVendorRecord)
    .find(
      (entry) =>
        entry.vendorCode.toUpperCase() === normalized &&
        (!excludeVendorId || entry.id !== excludeVendorId),
    );

  if (duplicate) {
    throw new Error("DUPLICATE_VENDOR_CODE");
  }
}

export function assertProcurementPermission(
  authorization: ProcurementAuthorizationService,
  context: ServiceContext,
  permission: PermissionCode,
  resourceOrganizationId?: string,
): void {
  const result = authorization.authorize(context, permission, { resourceOrganizationId });
  if (!result.allowed) {
    throw new AuthorizationError("FORBIDDEN", result.reason, permission);
  }
}
