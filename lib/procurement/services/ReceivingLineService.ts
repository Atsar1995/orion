/**
 * Receiving line management service (Mission P-010.10 · ADR-015).
 */

import { randomUUID } from "crypto";
import type { ProcurementAggregateRecord } from "@/lib/procurement/persistence/ProcurementStoreBacking";
import type { ProcurementPersistenceRepository } from "@/lib/procurement/persistence/ProcurementPersistenceRepository";
import { PROCUREMENT_PERMISSIONS } from "@/lib/procurement/security/procurement-permission-catalog";
import type { ProcurementAuthorizationService } from "@/lib/procurement/security/ProcurementAuthorizationService";
import { canEditGoodsReceiptLines } from "@/lib/procurement/services/goodsReceiptWorkflow";
import { parseQuantity } from "@/lib/procurement/services/goodsReceiptQuantity";
import type {
  CreateReceivingLineInput,
  ReceivingLineRecord,
  UpdateReceivingLineInput,
} from "@/lib/procurement/types/goods-receipt";
import {
  assertProcurementPermission,
  asReceivingLineRecord,
  getGoodsReceiptOrThrow,
  getReceivingLineOrThrow,
  listReceivingLinesForReceipt,
  nowIso,
} from "@/lib/procurement/services/procurementServiceUtils";
import type { ServiceContext } from "@/types/services";

/** Receiving line CRUD scoped to a goods receipt. */
export class ReceivingLineService {
  constructor(
    private readonly repository: ProcurementPersistenceRepository,
    private readonly authorization: ProcurementAuthorizationService,
  ) {}

  listLines(goodsReceiptId: string, context: ServiceContext): readonly ReceivingLineRecord[] {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.goodsReceiptRead,
      context.organizationId,
    );

    getGoodsReceiptOrThrow(this.repository, goodsReceiptId, context);
    return listReceivingLinesForReceipt(this.repository, goodsReceiptId, context.organizationId);
  }

  createLine(
    goodsReceiptId: string,
    input: CreateReceivingLineInput,
    context: ServiceContext,
  ): ReceivingLineRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.goodsReceiptWrite,
      context.organizationId,
    );

    const receipt = getGoodsReceiptOrThrow(this.repository, goodsReceiptId, context);
    if (!canEditGoodsReceiptLines(receipt.status)) {
      throw new Error("GOODS_RECEIPT_NOT_EDITABLE");
    }

    if (!input.itemCode.trim()) {
      throw new Error("INVALID_ITEM_CODE");
    }

    parseQuantity(input.orderedQuantity);

    const timestamp = nowIso();
    const record: ReceivingLineRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      goodsReceiptId,
      purchaseOrderId: receipt.purchaseOrderId,
      itemCode: input.itemCode.trim().toUpperCase(),
      description: input.description?.trim(),
      orderedQuantity: input.orderedQuantity,
      receivedQuantity: "0",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    return asReceivingLineRecord(
      this.repository.upsert("receivingLines", record as ProcurementAggregateRecord),
    );
  }

  updateLine(
    goodsReceiptId: string,
    lineId: string,
    input: UpdateReceivingLineInput,
    context: ServiceContext,
  ): ReceivingLineRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.goodsReceiptWrite,
      context.organizationId,
    );

    const receipt = getGoodsReceiptOrThrow(this.repository, goodsReceiptId, context);
    if (!canEditGoodsReceiptLines(receipt.status)) {
      throw new Error("GOODS_RECEIPT_NOT_EDITABLE");
    }

    const existing = getReceivingLineOrThrow(this.repository, lineId, context);
    if (existing.goodsReceiptId !== goodsReceiptId) {
      throw new Error("RECEIVING_LINE_NOT_FOUND");
    }

    if (input.orderedQuantity) {
      parseQuantity(input.orderedQuantity);
    }

    const timestamp = nowIso();
    return asReceivingLineRecord(
      this.repository.upsert("receivingLines", {
        ...existing,
        itemCode: input.itemCode?.trim().toUpperCase() ?? existing.itemCode,
        description: input.description?.trim() ?? existing.description,
        orderedQuantity: input.orderedQuantity ?? existing.orderedQuantity,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );
  }
}
