/**
 * Supplier (vendor) lifecycle service (Mission P-010.7 · ADR-015).
 */

import { randomUUID } from "crypto";
import type { ProcurementAggregateRecord } from "@/lib/procurement/persistence/ProcurementStoreBacking";
import type { ProcurementPersistenceRepository } from "@/lib/procurement/persistence/ProcurementPersistenceRepository";
import { ProcurementCanonicalEventPublisher } from "@/lib/procurement/events/ProcurementCanonicalEventPublisher";
import { PROCUREMENT_PERMISSIONS } from "@/lib/procurement/security/procurement-permission-catalog";
import type { ProcurementAuthorizationService } from "@/lib/procurement/security/ProcurementAuthorizationService";
import type {
  CreateSupplierInput,
  SupplierListFilter,
  SupplierListView,
  UpdateSupplierInput,
  VendorRecord,
  VendorStatus,
} from "@/lib/procurement/types/supplier";
import {
  assertProcurementPermission,
  assertUniqueVendorCode,
  asVendorRecord,
  getVendorOrThrow,
  nowIso,
} from "@/lib/procurement/services/procurementServiceUtils";
import type { ServiceContext } from "@/types/services";

/** Supplier master lifecycle — persist then publish canonical events (ADR-014). */
export class SupplierService {
  constructor(
    private readonly repository: ProcurementPersistenceRepository,
    private readonly authorization: ProcurementAuthorizationService,
    private readonly canonicalPublisher: ProcurementCanonicalEventPublisher,
  ) {}

  listSuppliers(context: ServiceContext, filter: SupplierListFilter = {}): SupplierListView {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.supplierRead,
      context.organizationId,
    );

    const query = filter.query?.trim().toLowerCase();
    const items = this.repository
      .listByOrganization(context.organizationId, "vendors")
      .map(asVendorRecord)
      .filter((entry) => (filter.status ? entry.status === filter.status : true))
      .filter((entry) =>
        query
          ? entry.displayName.toLowerCase().includes(query) ||
            entry.vendorCode.toLowerCase().includes(query)
          : true,
      );

    return { total: items.length, items };
  }

  getSupplier(vendorId: string, context: ServiceContext): VendorRecord | null {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.supplierRead,
      context.organizationId,
    );

    const record = this.repository.getById(context.organizationId, "vendors", vendorId);
    return record ? asVendorRecord(record) : null;
  }

  createSupplier(input: CreateSupplierInput, context: ServiceContext): VendorRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.supplierWrite,
      context.organizationId,
    );

    if (!input.displayName.trim()) {
      throw new Error("INVALID_VENDOR_NAME");
    }

    assertUniqueVendorCode(this.repository, context.organizationId, input.vendorCode);

    const timestamp = nowIso();
    const record: VendorRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      vendorCode: input.vendorCode.trim().toUpperCase(),
      displayName: input.displayName.trim(),
      legalName: input.legalName?.trim() ?? input.displayName.trim(),
      status: "draft",
      email: input.email?.trim(),
      phone: input.phone?.trim(),
      country: input.country?.trim(),
      taxId: input.taxId?.trim(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const created = asVendorRecord(
      this.repository.upsert("vendors", record as ProcurementAggregateRecord),
    );

    this.canonicalPublisher.publishVendorCreated(
      {
        vendorId: created.id,
        correlationId: created.id,
        displayName: created.displayName,
      },
      context,
    );

    return created;
  }

  updateSupplier(
    vendorId: string,
    input: UpdateSupplierInput,
    context: ServiceContext,
  ): VendorRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.supplierWrite,
      context.organizationId,
    );

    const existing = getVendorOrThrow(this.repository, vendorId, context);
    const timestamp = nowIso();

    const updated = asVendorRecord(
      this.repository.upsert("vendors", {
        ...existing,
        displayName: input.displayName?.trim() ?? existing.displayName,
        legalName: input.legalName?.trim() ?? existing.legalName,
        email: input.email?.trim() ?? existing.email,
        phone: input.phone?.trim() ?? existing.phone,
        country: input.country?.trim() ?? existing.country,
        taxId: input.taxId?.trim() ?? existing.taxId,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );

    this.publishVendorUpdated(updated, context, "updated");
    return updated;
  }

  qualifySupplier(vendorId: string, context: ServiceContext): VendorRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.vendorApprove,
      context.organizationId,
    );

    const existing = getVendorOrThrow(this.repository, vendorId, context);
    if (existing.status === "qualified" || existing.status === "active") {
      return existing;
    }

    if (existing.status !== "draft" && existing.status !== "pending_qualification") {
      throw new Error("VENDOR_NOT_QUALIFIABLE");
    }

    const timestamp = nowIso();
    const updated = asVendorRecord(
      this.repository.upsert("vendors", {
        ...existing,
        status: "qualified" satisfies VendorStatus,
        qualifiedAt: timestamp,
        qualifiedBy: context.userId,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );

    this.publishVendorUpdated(updated, context, "qualified");
    return updated;
  }

  activateSupplier(vendorId: string, context: ServiceContext): VendorRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.supplierWrite,
      context.organizationId,
    );

    const existing = getVendorOrThrow(this.repository, vendorId, context);
    if (existing.status === "active") {
      return existing;
    }

    if (existing.status !== "qualified" && existing.status !== "inactive") {
      throw new Error("VENDOR_NOT_ACTIVATABLE");
    }

    const timestamp = nowIso();
    const updated = asVendorRecord(
      this.repository.upsert("vendors", {
        ...existing,
        status: "active",
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );

    this.publishVendorUpdated(updated, context, "activated");
    return updated;
  }

  deactivateSupplier(vendorId: string, context: ServiceContext): VendorRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.supplierWrite,
      context.organizationId,
    );

    const existing = getVendorOrThrow(this.repository, vendorId, context);
    if (existing.status === "inactive") {
      return existing;
    }

    const timestamp = nowIso();
    const updated = asVendorRecord(
      this.repository.upsert("vendors", {
        ...existing,
        status: "inactive",
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );

    this.publishVendorUpdated(updated, context, "deactivated");
    return updated;
  }

  private publishVendorUpdated(
    vendor: VendorRecord,
    context: ServiceContext,
    changeType: string,
  ): void {
    this.canonicalPublisher.publishVendorUpdated(
      {
        vendorId: vendor.id,
        correlationId: vendor.id,
        version: `${vendor.updatedAt}:${changeType}`,
        changeType,
      },
      context,
    );
  }
}
