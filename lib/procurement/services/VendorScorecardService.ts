/**
 * Vendor scorecard management service (Mission P-010.7 · ADR-015).
 */

import { randomUUID } from "crypto";
import type { ProcurementPersistenceRepository } from "@/lib/procurement/persistence/ProcurementPersistenceRepository";
import { PROCUREMENT_PERMISSIONS } from "@/lib/procurement/security/procurement-permission-catalog";
import type { ProcurementAuthorizationService } from "@/lib/procurement/security/ProcurementAuthorizationService";
import type {
  CreateVendorScorecardInput,
  UpdateVendorScorecardInput,
  VendorScorecardRecord,
} from "@/lib/procurement/types/supplier";
import {
  assertProcurementPermission,
  getVendorOrThrow,
  nowIso,
} from "@/lib/procurement/services/procurementServiceUtils";
import type { ProcurementAggregateRecord } from "@/lib/procurement/persistence/ProcurementStoreBacking";
import type { ServiceContext } from "@/types/services";

function asVendorScorecardRecord(record: ProcurementAggregateRecord): VendorScorecardRecord {
  return record as VendorScorecardRecord;
}

/** Vendor performance scorecard operations. */
export class VendorScorecardService {
  constructor(
    private readonly repository: ProcurementPersistenceRepository,
    private readonly authorization: ProcurementAuthorizationService,
  ) {}

  listScorecards(vendorId: string, context: ServiceContext): readonly VendorScorecardRecord[] {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.supplierRead,
      context.organizationId,
    );

    getVendorOrThrow(this.repository, vendorId, context);

    return this.repository
      .listByOrganization(context.organizationId, "vendorScorecards")
      .map(asVendorScorecardRecord)
      .filter((entry) => entry.vendorId === vendorId);
  }

  createScorecard(
    vendorId: string,
    input: CreateVendorScorecardInput,
    context: ServiceContext,
  ): VendorScorecardRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.supplierWrite,
      context.organizationId,
    );

    getVendorOrThrow(this.repository, vendorId, context);

    if (!input.period.trim()) {
      throw new Error("INVALID_SCORECARD_PERIOD");
    }

    const timestamp = nowIso();
    const record: VendorScorecardRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      vendorId,
      period: input.period.trim(),
      deliveryScore: input.deliveryScore,
      qualityScore: input.qualityScore,
      costScore: input.costScore,
      overallScore: input.overallScore,
      notes: input.notes?.trim(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    return asVendorScorecardRecord(
      this.repository.upsert("vendorScorecards", record as ProcurementAggregateRecord),
    );
  }

  updateScorecard(
    vendorId: string,
    scorecardId: string,
    input: UpdateVendorScorecardInput,
    context: ServiceContext,
  ): VendorScorecardRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.supplierWrite,
      context.organizationId,
    );

    getVendorOrThrow(this.repository, vendorId, context);

    const existing = this.repository.getById(
      context.organizationId,
      "vendorScorecards",
      scorecardId,
    );
    if (!existing) {
      throw new Error("VENDOR_SCORECARD_NOT_FOUND");
    }

    const scorecard = asVendorScorecardRecord(existing);
    if (scorecard.vendorId !== vendorId) {
      throw new Error("VENDOR_SCORECARD_NOT_FOUND");
    }

    return asVendorScorecardRecord(
      this.repository.upsert("vendorScorecards", {
        ...scorecard,
        deliveryScore: input.deliveryScore ?? scorecard.deliveryScore,
        qualityScore: input.qualityScore ?? scorecard.qualityScore,
        costScore: input.costScore ?? scorecard.costScore,
        overallScore: input.overallScore ?? scorecard.overallScore,
        notes: input.notes?.trim() ?? scorecard.notes,
        updatedAt: nowIso(),
      } as ProcurementAggregateRecord),
    );
  }
}
