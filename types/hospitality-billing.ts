/**
 * ORION Hospitality — Billing, Folio & Revenue Operations (Mission P-007.6).
 * Folio is the canonical financial object; Finance Workspace consumes financial events.
 */

export type FolioType = "individual" | "group" | "company" | "split" | "master";

export type FolioStatus = "open" | "pending_settlement" | "settled" | "refunded" | "written_off";

export type ChargeCategory =
  | "accommodation"
  | "food_beverage"
  | "laundry"
  | "transport"
  | "spa"
  | "activities"
  | "telephone"
  | "miscellaneous"
  | "discount"
  | "service_charge"
  | "tax";

export type PaymentMethod =
  | "cash"
  | "card"
  | "bank_transfer"
  | "digital_wallet"
  | "corporate_billing"
  | "credit_account";

export type InvoiceType = "proforma" | "tax_invoice" | "credit_note" | "debit_note";

export type InvoiceStatus = "draft" | "issued" | "paid" | "void";

export type AdjustmentType = "discount" | "write_off" | "correction" | "service_recovery";

export type RevenueEventType =
  | "charge_posted"
  | "payment_received"
  | "refund_issued"
  | "folio_settled"
  | "deposit_collected";

/** Canonical folio — primary financial object for hospitality operations. */
export type FolioRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly propertyId: string;
  readonly folioType: FolioType;
  readonly reservationId: string;
  readonly stayId?: string;
  readonly guestId: string;
  readonly masterFolioId?: string;
  readonly companyAccountId?: string;
  readonly status: FolioStatus;
  readonly currency: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly settledAt?: string;
};

export type ChargeRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly propertyId: string;
  readonly folioId: string;
  readonly description: string;
  readonly category: ChargeCategory;
  readonly amount: number;
  readonly taxRate: number;
  readonly taxAmount: number;
  readonly serviceChargeRate?: number;
  readonly postedAt: string;
  readonly postedBy?: string;
  readonly reference?: string;
};

export type PaymentRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly propertyId: string;
  readonly folioId: string;
  readonly amount: number;
  readonly method: PaymentMethod;
  readonly reference?: string;
  readonly postedAt: string;
  readonly postedBy?: string;
};

export type DepositRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly propertyId: string;
  readonly folioId: string;
  readonly amount: number;
  readonly method: PaymentMethod;
  readonly status: "held" | "applied" | "refunded";
  readonly collectedAt: string;
};

export type RefundRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly propertyId: string;
  readonly folioId: string;
  readonly amount: number;
  readonly method: PaymentMethod;
  readonly reason: string;
  readonly issuedAt: string;
};

export type AdjustmentRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly propertyId: string;
  readonly folioId: string;
  readonly type: AdjustmentType;
  readonly amount: number;
  readonly reason: string;
  readonly adjustedAt: string;
};

export type InvoiceRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly propertyId: string;
  readonly folioId: string;
  readonly type: InvoiceType;
  readonly status: InvoiceStatus;
  readonly invoiceNumber: string;
  readonly subtotal: number;
  readonly taxTotal: number;
  readonly total: number;
  readonly issuedAt: string;
};

export type TaxRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly propertyId: string;
  readonly folioId: string;
  readonly chargeId: string;
  readonly taxCode: string;
  readonly rate: number;
  readonly amount: number;
  readonly recordedAt: string;
};

export type RevenueEventRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly propertyId: string;
  readonly folioId?: string;
  readonly reservationId?: string;
  readonly eventType: RevenueEventType;
  readonly category?: ChargeCategory;
  readonly amount: number;
  readonly currency: string;
  readonly source?: string;
  readonly marketSegment?: string;
  readonly accommodationTypeId?: string;
  readonly occurredAt: string;
};

export type CreateFolioInput = {
  readonly propertyId: string;
  readonly folioType?: FolioType;
  readonly reservationId: string;
  readonly stayId?: string;
  readonly guestId: string;
  readonly masterFolioId?: string;
  readonly companyAccountId?: string;
};

export type PostChargeInput = {
  readonly folioId: string;
  readonly description: string;
  readonly category: ChargeCategory;
  readonly amount: number;
  readonly taxCode?: string;
  readonly serviceChargeRate?: number;
  readonly reference?: string;
};

export type ProcessPaymentInput = {
  readonly folioId: string;
  readonly amount: number;
  readonly method: PaymentMethod;
  readonly reference?: string;
};

export type CollectDepositInput = {
  readonly folioId: string;
  readonly amount: number;
  readonly method: PaymentMethod;
};

export type IssueRefundInput = {
  readonly folioId: string;
  readonly amount: number;
  readonly method: PaymentMethod;
  readonly reason: string;
};

export type CreateAdjustmentInput = {
  readonly folioId: string;
  readonly type: AdjustmentType;
  readonly amount: number;
  readonly reason: string;
};

export type GenerateInvoiceInput = {
  readonly folioId: string;
  readonly type: InvoiceType;
};

export type BillingBriefSignals = {
  readonly todaysRevenue: number;
  readonly outstandingBalances: number;
  readonly pendingPayments: number;
  readonly averageDailyRate: number;
  readonly revpar: number;
  readonly highValueGuestCount: number;
  readonly openFolioCount: number;
};

export type PublishBillingEventInput = {
  readonly eventType:
    | "ChargePosted"
    | "PaymentReceived"
    | "FolioSettled"
    | "RefundIssued"
    | "DepositCollected"
    | "InvoiceGenerated"
    | "RevenueRecorded";
  readonly folioId?: string;
  readonly chargeId?: string;
  readonly paymentId?: string;
  readonly invoiceId?: string;
  readonly amount?: number;
  readonly actorId: string;
  readonly actorName?: string;
  readonly payload?: Record<string, unknown>;
};
