import type {
  AdjustmentRecord,
  ChargeRecord,
  CollectDepositInput,
  CreateAdjustmentInput,
  CreateFolioInput,
  DepositRecord,
  FolioRecord,
  GenerateInvoiceInput,
  InvoiceRecord,
  IssueRefundInput,
  PaymentRecord,
  PostChargeInput,
  ProcessPaymentInput,
  RefundRecord,
  RevenueEventRecord,
  TaxRecord,
} from "@/types/hospitality-billing";
import type { Folio } from "@/types/hospitality";
import type { HousekeepingRepository } from "@/lib/hospitality/repositories/HousekeepingRepository";

/** Billing & revenue data access contract (Mission P-007.6). */
export type BillingRepository = HousekeepingRepository & {
  listFolioRecords(organizationId: string, propertyId?: string): FolioRecord[];
  getFolioRecord(id: string): FolioRecord | null;
  getFolioByReservation(reservationId: string): FolioRecord | null;
  getFolioByStay(stayId: string): FolioRecord | null;
  createFolioRecord(record: FolioRecord): FolioRecord;
  updateFolioRecord(id: string, patch: Partial<FolioRecord>): FolioRecord | null;
  listCharges(folioId: string): ChargeRecord[];
  createCharge(record: ChargeRecord): ChargeRecord;
  listPayments(folioId: string): PaymentRecord[];
  createPayment(record: PaymentRecord): PaymentRecord;
  listDeposits(folioId: string): DepositRecord[];
  createDeposit(record: DepositRecord): DepositRecord;
  listRefunds(folioId: string): RefundRecord[];
  createRefund(record: RefundRecord): RefundRecord;
  listAdjustments(folioId: string): AdjustmentRecord[];
  createAdjustment(record: AdjustmentRecord): AdjustmentRecord;
  listInvoices(organizationId: string, propertyId?: string): InvoiceRecord[];
  createInvoice(record: InvoiceRecord): InvoiceRecord;
  listTaxRecords(folioId: string): TaxRecord[];
  createTaxRecord(record: TaxRecord): TaxRecord;
  listRevenueEvents(organizationId: string, propertyId?: string): RevenueEventRecord[];
  createRevenueEvent(record: RevenueEventRecord): RevenueEventRecord;
  /** Legacy compatibility */
  listFolios(organizationId: string): Folio[];
  getFolio(id: string): Folio | null;
};

export type {
  CreateFolioInput,
  PostChargeInput,
  ProcessPaymentInput,
  CollectDepositInput,
  IssueRefundInput,
  CreateAdjustmentInput,
  GenerateInvoiceInput,
};
