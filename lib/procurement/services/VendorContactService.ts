/**
 * Vendor contact management service (Mission P-010.7 · ADR-015).
 */

import { randomUUID } from "crypto";
import type { ProcurementPersistenceRepository } from "@/lib/procurement/persistence/ProcurementPersistenceRepository";
import { PROCUREMENT_PERMISSIONS } from "@/lib/procurement/security/procurement-permission-catalog";
import type { ProcurementAuthorizationService } from "@/lib/procurement/security/ProcurementAuthorizationService";
import type {
  CreateVendorContactInput,
  UpdateVendorContactInput,
  VendorContactRecord,
} from "@/lib/procurement/types/supplier";
import {
  assertProcurementPermission,
  getVendorOrThrow,
  nowIso,
} from "@/lib/procurement/services/procurementServiceUtils";
import type { ProcurementAggregateRecord } from "@/lib/procurement/persistence/ProcurementStoreBacking";
import type { ServiceContext } from "@/types/services";

function asVendorContactRecord(record: ProcurementAggregateRecord): VendorContactRecord {
  return record as VendorContactRecord;
}

/** Vendor contact operations scoped to an organization supplier. */
export class VendorContactService {
  constructor(
    private readonly repository: ProcurementPersistenceRepository,
    private readonly authorization: ProcurementAuthorizationService,
  ) {}

  listContacts(vendorId: string, context: ServiceContext): readonly VendorContactRecord[] {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.supplierRead,
      context.organizationId,
    );

    getVendorOrThrow(this.repository, vendorId, context);

    return this.repository
      .listByOrganization(context.organizationId, "vendorContacts")
      .map(asVendorContactRecord)
      .filter((entry) => entry.vendorId === vendorId);
  }

  createContact(
    vendorId: string,
    input: CreateVendorContactInput,
    context: ServiceContext,
  ): VendorContactRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.supplierWrite,
      context.organizationId,
    );

    getVendorOrThrow(this.repository, vendorId, context);

    if (!input.firstName.trim() || !input.lastName.trim()) {
      throw new Error("INVALID_CONTACT_NAME");
    }

    const timestamp = nowIso();
    const record: VendorContactRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      vendorId,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email?.trim(),
      phone: input.phone?.trim(),
      role: input.role?.trim(),
      isPrimary: input.isPrimary ?? false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    return asVendorContactRecord(
      this.repository.upsert("vendorContacts", record as ProcurementAggregateRecord),
    );
  }

  updateContact(
    vendorId: string,
    contactId: string,
    input: UpdateVendorContactInput,
    context: ServiceContext,
  ): VendorContactRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.supplierWrite,
      context.organizationId,
    );

    getVendorOrThrow(this.repository, vendorId, context);

    const existing = this.repository.getById(context.organizationId, "vendorContacts", contactId);
    if (!existing) {
      throw new Error("VENDOR_CONTACT_NOT_FOUND");
    }

    const contact = asVendorContactRecord(existing);
    if (contact.vendorId !== vendorId) {
      throw new Error("VENDOR_CONTACT_NOT_FOUND");
    }

    const updated = asVendorContactRecord(
      this.repository.upsert("vendorContacts", {
        ...contact,
        firstName: input.firstName?.trim() ?? contact.firstName,
        lastName: input.lastName?.trim() ?? contact.lastName,
        email: input.email?.trim() ?? contact.email,
        phone: input.phone?.trim() ?? contact.phone,
        role: input.role?.trim() ?? contact.role,
        isPrimary: input.isPrimary ?? contact.isPrimary,
        updatedAt: nowIso(),
      } as ProcurementAggregateRecord),
    );

    return updated;
  }
}
