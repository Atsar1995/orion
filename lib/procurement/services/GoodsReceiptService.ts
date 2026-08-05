/**
 * Goods receipt lifecycle service (Mission P-010.10 · ADR-015).
 */

import { randomUUID } from "crypto";
import type { ProcurementAggregateRecord } from "@/lib/procurement/persistence/ProcurementStoreBacking";
import type { ProcurementPersistenceRepository } from "@/lib/procurement/persistence/ProcurementPersistenceRepository";
import { ProcurementCanonicalEventPublisher } from "@/lib/procurement/events/ProcurementCanonicalEventPublisher";
import { PROCUREMENT_PERMISSIONS } from "@/lib/procurement/security/procurement-permission-catalog";
import type { ProcurementAuthorizationService } from "@/lib/procurement/security/ProcurementAuthorizationService";
import {
  areAllLinesFullyReceived,
  assertQuantityNotExceeded,
  hasAnyPartialLine,
  isAnyLineReceived,
  parseQuantity,
} from "@/lib/procurement/services/goodsReceiptQuantity";
import {
  assertGoodsReceiptTransition,
  canReceiveItems,
} from "@/lib/procurement/services/goodsReceiptWorkflow";
import type {
  CreateGoodsReceiptInput,
  GoodsReceiptListFilter,
  GoodsReceiptListView,
  GoodsReceiptRecord,
  ReceiveItemsInput,
  ReceivingLineRecord,
  UpdateGoodsReceiptInput,
} from "@/lib/procurement/types/goods-receipt";
import {
  assertApprovedPurchaseOrderForReceipt,
  assertProcurementPermission,
  assertUniqueGoodsReceiptNumber,
  asGoodsReceiptRecord,
  asReceivingLineRecord,
  getGoodsReceiptOrThrow,
  getReceivingLineOrThrow,
  listReceivingLinesForReceipt,
  nowIso,
} from "@/lib/procurement/services/procurementServiceUtils";
import type { ServiceContext } from "@/types/services";

/** Goods receipt workflow — persist then publish canonical events on completion (ADR-014). */
export class GoodsReceiptService {
  constructor(
    private readonly repository: ProcurementPersistenceRepository,
    private readonly authorization: ProcurementAuthorizationService,
    private readonly canonicalPublisher: ProcurementCanonicalEventPublisher,
  ) {}

  listGoodsReceipts(
    context: ServiceContext,
    filter: GoodsReceiptListFilter = {},
  ): GoodsReceiptListView {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.goodsReceiptRead,
      context.organizationId,
    );

    const query = filter.query?.trim().toLowerCase();
    const items = this.repository
      .listByOrganization(context.organizationId, "goodsReceipts")
      .map(asGoodsReceiptRecord)
      .filter((entry) => (filter.status ? entry.status === filter.status : true))
      .filter((entry) =>
        filter.purchaseOrderId ? entry.purchaseOrderId === filter.purchaseOrderId : true,
      )
      .filter((entry) =>
        query ? entry.goodsReceiptNumber.toLowerCase().includes(query) : true,
      );

    return { total: items.length, items };
  }

  getGoodsReceipt(goodsReceiptId: string, context: ServiceContext): GoodsReceiptRecord | null {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.goodsReceiptRead,
      context.organizationId,
    );

    const record = this.repository.getById(
      context.organizationId,
      "goodsReceipts",
      goodsReceiptId,
    );
    return record ? asGoodsReceiptRecord(record) : null;
  }

  createGoodsReceipt(
    input: CreateGoodsReceiptInput,
    context: ServiceContext,
  ): GoodsReceiptRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.goodsReceiptWrite,
      context.organizationId,
    );

    const purchaseOrder = assertApprovedPurchaseOrderForReceipt(
      this.repository,
      input.purchaseOrderId,
      context,
    );
    assertUniqueGoodsReceiptNumber(
      this.repository,
      context.organizationId,
      input.goodsReceiptNumber,
    );

    const timestamp = nowIso();
    const record: GoodsReceiptRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      goodsReceiptNumber: input.goodsReceiptNumber.trim().toUpperCase(),
      status: "draft",
      purchaseOrderId: purchaseOrder.id,
      vendorId: purchaseOrder.vendorId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const created = asGoodsReceiptRecord(
      this.repository.upsert("goodsReceipts", record as ProcurementAggregateRecord),
    );

    for (const line of input.lines ?? []) {
      this.createReceivingLine(created.id, created.purchaseOrderId, line, context, timestamp);
    }

    return created;
  }

  updateGoodsReceipt(
    goodsReceiptId: string,
    input: UpdateGoodsReceiptInput,
    context: ServiceContext,
  ): GoodsReceiptRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.goodsReceiptWrite,
      context.organizationId,
    );

    const existing = getGoodsReceiptOrThrow(this.repository, goodsReceiptId, context);
    if (existing.status !== "draft") {
      throw new Error("GOODS_RECEIPT_NOT_EDITABLE");
    }

    if (input.goodsReceiptNumber) {
      assertUniqueGoodsReceiptNumber(
        this.repository,
        context.organizationId,
        input.goodsReceiptNumber,
        goodsReceiptId,
      );
    }

    const timestamp = nowIso();
    return asGoodsReceiptRecord(
      this.repository.upsert("goodsReceipts", {
        ...existing,
        goodsReceiptNumber:
          input.goodsReceiptNumber?.trim().toUpperCase() ?? existing.goodsReceiptNumber,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );
  }

  startReceiving(goodsReceiptId: string, context: ServiceContext): GoodsReceiptRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.goodsReceiptWrite,
      context.organizationId,
    );

    const existing = getGoodsReceiptOrThrow(this.repository, goodsReceiptId, context);
    const lines = listReceivingLinesForReceipt(
      this.repository,
      goodsReceiptId,
      context.organizationId,
    );
    if (lines.length === 0) {
      throw new Error("GOODS_RECEIPT_HAS_NO_LINES");
    }

    assertGoodsReceiptTransition(existing.status, "receiving");

    const timestamp = nowIso();
    return asGoodsReceiptRecord(
      this.repository.upsert("goodsReceipts", {
        ...existing,
        status: "receiving",
        receivingStartedAt: timestamp,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );
  }

  receiveItems(
    goodsReceiptId: string,
    input: ReceiveItemsInput,
    context: ServiceContext,
  ): GoodsReceiptRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.goodsReceiptWrite,
      context.organizationId,
    );

    const existing = getGoodsReceiptOrThrow(this.repository, goodsReceiptId, context);
    if (!canReceiveItems(existing.status)) {
      throw new Error("GOODS_RECEIPT_NOT_RECEIVABLE");
    }

    if (input.lines.length === 0) {
      throw new Error("RECEIVE_ITEMS_EMPTY");
    }

    const timestamp = nowIso();
    for (const entry of input.lines) {
      const line = getReceivingLineOrThrow(this.repository, entry.lineId, context);
      if (line.goodsReceiptId !== goodsReceiptId) {
        throw new Error("RECEIVING_LINE_NOT_FOUND");
      }

      parseQuantity(entry.receivedQuantity);
      assertQuantityNotExceeded(entry.receivedQuantity, line.orderedQuantity);

      this.repository.upsert("receivingLines", {
        ...line,
        receivedQuantity: entry.receivedQuantity,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord);
    }

    const updatedLines = listReceivingLinesForReceipt(
      this.repository,
      goodsReceiptId,
      context.organizationId,
    );
    const nextStatus = this.resolveReceiptStatusAfterReceive(existing.status, updatedLines);

    return asGoodsReceiptRecord(
      this.repository.upsert("goodsReceipts", {
        ...existing,
        status: nextStatus,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );
  }

  partialReceipt(
    goodsReceiptId: string,
    input: ReceiveItemsInput,
    context: ServiceContext,
  ): GoodsReceiptRecord {
    const updated = this.receiveItems(goodsReceiptId, input, context);
    const lines = listReceivingLinesForReceipt(
      this.repository,
      goodsReceiptId,
      context.organizationId,
    );

    if (!hasAnyPartialLine(lines)) {
      throw new Error("NOT_A_PARTIAL_RECEIPT");
    }

    return updated;
  }

  completeReceipt(goodsReceiptId: string, context: ServiceContext): GoodsReceiptRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.goodsReceiptWrite,
      context.organizationId,
    );

    const existing = getGoodsReceiptOrThrow(this.repository, goodsReceiptId, context);
    if (existing.status === "received") {
      return existing;
    }

    const lines = listReceivingLinesForReceipt(
      this.repository,
      goodsReceiptId,
      context.organizationId,
    );
    if (lines.length === 0) {
      throw new Error("GOODS_RECEIPT_HAS_NO_LINES");
    }
    if (!areAllLinesFullyReceived(lines)) {
      throw new Error("GOODS_RECEIPT_NOT_FULLY_RECEIVED");
    }

    assertGoodsReceiptTransition(existing.status, "received");

    const timestamp = nowIso();
    const completed = asGoodsReceiptRecord(
      this.repository.upsert("goodsReceipts", {
        ...existing,
        status: "received",
        receivedAt: timestamp,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );

    this.canonicalPublisher.publishGoodsReceived(
      {
        goodsReceiptId: completed.id,
        correlationId: completed.id,
        purchaseOrderId: completed.purchaseOrderId,
      },
      context,
    );

    return completed;
  }

  cancelReceipt(goodsReceiptId: string, context: ServiceContext): GoodsReceiptRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.goodsReceiptWrite,
      context.organizationId,
    );

    const existing = getGoodsReceiptOrThrow(this.repository, goodsReceiptId, context);
    if (existing.status === "cancelled") {
      return existing;
    }

    assertGoodsReceiptTransition(existing.status, "cancelled");

    const timestamp = nowIso();
    return asGoodsReceiptRecord(
      this.repository.upsert("goodsReceipts", {
        ...existing,
        status: "cancelled",
        cancelledAt: timestamp,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );
  }

  closeReceipt(goodsReceiptId: string, context: ServiceContext): GoodsReceiptRecord {
    assertProcurementPermission(
      this.authorization,
      context,
      PROCUREMENT_PERMISSIONS.goodsReceiptWrite,
      context.organizationId,
    );

    const existing = getGoodsReceiptOrThrow(this.repository, goodsReceiptId, context);
    if (existing.status === "closed") {
      return existing;
    }

    assertGoodsReceiptTransition(existing.status, "closed");

    const timestamp = nowIso();
    return asGoodsReceiptRecord(
      this.repository.upsert("goodsReceipts", {
        ...existing,
        status: "closed",
        closedAt: timestamp,
        updatedAt: timestamp,
      } as ProcurementAggregateRecord),
    );
  }

  private resolveReceiptStatusAfterReceive(
    current: GoodsReceiptRecord["status"],
    lines: readonly ReceivingLineRecord[],
  ): GoodsReceiptRecord["status"] {
    if (!isAnyLineReceived(lines)) {
      return current;
    }

    if (current === "partially_received") {
      return "partially_received";
    }

    return assertGoodsReceiptTransition(current, "partially_received");
  }

  private createReceivingLine(
    goodsReceiptId: string,
    purchaseOrderId: string,
    input: NonNullable<CreateGoodsReceiptInput["lines"]>[number],
    context: ServiceContext,
    timestamp: string,
  ): ReceivingLineRecord {
    if (!input.itemCode.trim()) {
      throw new Error("INVALID_ITEM_CODE");
    }

    parseQuantity(input.orderedQuantity);

    const record: ReceivingLineRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      goodsReceiptId,
      purchaseOrderId,
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
}
