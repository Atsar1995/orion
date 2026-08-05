/**
 * Purchase contract management service (Mission P-010.9 · ADR-015).
 */

import { randomUUID } from "crypto";
import type { ProcurementAggregateRecord } from "@/lib/procurement/persistence/ProcurementStoreBacking";
import type { ProcurementPersistenceRepository } from "@/lib/procurement/persistence/ProcurementPersistenceRepository";
import { PROCUREMENT_PERMISSIONS } from "@/lib/procurement/security/procurement-permission-catalog";
import type { ProcurementAuthorizationService } from "@/lib/procurement/security/ProcurementAuthorizationService";
import type {
  CreatePurchaseContractInput,
  PurchaseContractRecord,
  UpdatePurchaseContractInput,
} from "@/lib/procurement/types/purchase-order";
import {
  assertProcurementPermission,
  assertUniqueContractNumber,
  asPurchaseContractRecord,
  getPurchaseContractOrThrow,
  getVendorOrThrow,
  nowIso,
} from "@/lib/procurement/services/procurementServiceUtils";
import type { ServiceContext } from "@/types/services";

/** Purchase contract lifecycle for vendor agreement linkage. */
export class PurchaseContractService {
  constructor(
    private readonly repository: ProcurementPersistenceRepository,
    private readonly authorization: ProcurementAuthorizationService,
  ) {}

  getContract(contractId: string, context: ServiceContext): PurchaseContractRecord | null {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.contractRead,
      context.organizationId,
    );

    const record = this.repository.getById(
      context.organizationId,
      "purchaseContracts",
      contractId,
    );
    return record ? asPurchaseContractRecord(record) : null;
  }

  createContract(
    input: CreatePurchaseContractInput,
    context: ServiceContext,
  ): PurchaseContractRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.contractWrite,
      context.organizationId,
    );

    if (!input.title.trim()) {
      throw new Error("INVALID_CONTRACT_TITLE");
    }

    getVendorOrThrow(this.repository, input.vendorId, context);
    assertUniqueContractNumber(this.repository, context.organizationId, input.contractNumber);

    const timestamp = nowIso();
    const record: PurchaseContractRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      contractNumber: input.contractNumber.trim().toUpperCase(),
      title: input.title.trim(),
      vendorId: input.vendorId,
      status: "draft",
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo,
      amount: input.amount,
      currencyCode: input.currencyCode,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    return asPurchaseContractRecord(
      this.repository.upsert("purchaseContracts", record as ProcurementAggregateRecord),
    );
  }

  updateContract(
    contractId: string,
    input: UpdatePurchaseContractInput,
    context: ServiceContext,
  ): PurchaseContractRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.contractWrite,
      context.organizationId,
    );

    const existing = getPurchaseContractOrThrow(this.repository, contractId, context);
    if (existing.status === "cancelled") {
      throw new Error("CONTRACT_NOT_EDITABLE");
    }

    const timestamp = nowIso();
    return asPurchaseContractRecord(
      this.repository.upsert("purchaseContracts", {
        ...existing,
        title: input.title?.trim() ?? existing.title,
        effectiveFrom: input.effectiveFrom ?? existing.effectiveFrom,
        effectiveTo: input.effectiveTo ?? existing.effectiveTo,
        amount: input.amount ?? existing.amount,
        currencyCode: input.currencyCode ?? existing.currencyCode,
        status: input.status ?? existing.status,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );
  }
}
