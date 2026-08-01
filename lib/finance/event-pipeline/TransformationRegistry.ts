import type { FinanceFinancialEventType } from "@/types/finance-events";
import type {
  BusinessEventIntakeInput,
  BusinessEventTransformer,
  FinancialEventClassification,
  PipelineBusinessEventType,
} from "@/types/finance-event-pipeline";

const DEFAULT_TRANSFORMERS: Record<
  PipelineBusinessEventType,
  { financialEventType: FinanceFinancialEventType; classification: FinancialEventClassification }
> = {
  SalesCompleted: { financialEventType: "RevenueRecognized", classification: "revenue" },
  OpportunityWon: { financialEventType: "RevenueRecognized", classification: "revenue" },
  ReservationConfirmed: { financialEventType: "RevenueRecognized", classification: "revenue" },
  FolioSettled: { financialEventType: "RevenueRecognized", classification: "revenue" },
  BillingChargePosted: { financialEventType: "RevenueRecognized", classification: "revenue" },
  ReservationCancelled: { financialEventType: "JournalReversed", classification: "adjustment" },
  InvoiceApproved: { financialEventType: "InvoiceIssued", classification: "revenue" },
  ContractSigned: { financialEventType: "InvoiceIssued", classification: "revenue" },
  ContractRenewed: { financialEventType: "InvoiceIssued", classification: "revenue" },
  RefundApproved: { financialEventType: "PaymentMade", classification: "payment" },
  PaymentReceived: { financialEventType: "PaymentReceived", classification: "payment" },
  VendorInvoiceApproved: { financialEventType: "ExpenseRecorded", classification: "expense" },
  PurchaseReceived: { financialEventType: "ExpenseRecorded", classification: "expense" },
  ExpenseApproved: { financialEventType: "ExpenseRecorded", classification: "expense" },
  SalaryApproved: { financialEventType: "ExpenseRecorded", classification: "payroll" },
  PayrollApproved: { financialEventType: "ExpenseRecorded", classification: "payroll" },
  InventoryAdjustment: { financialEventType: "ExpenseRecorded", classification: "inventory" },
  ManualFinancialEvent: { financialEventType: "RevenueRecognized", classification: "manual" },
  CustomEvent: { financialEventType: "RevenueRecognized", classification: "manual" },
};

/** Extensible business event → financial event transformation registry (Mission P-009.6). */
export class TransformationRegistry {
  private readonly transformers = new Map<PipelineBusinessEventType, BusinessEventTransformer>();

  constructor() {
    for (const [eventType, mapping] of Object.entries(DEFAULT_TRANSFORMERS)) {
      this.transformers.set(eventType as PipelineBusinessEventType, (input) => ({
        financialEventType: mapping.financialEventType,
        classification: mapping.classification,
      }));
    }
  }

  register(eventType: PipelineBusinessEventType, transformer: BusinessEventTransformer): void {
    this.transformers.set(eventType, transformer);
  }

  transform(input: BusinessEventIntakeInput): {
    financialEventType: FinanceFinancialEventType;
    classification: FinancialEventClassification;
  } {
    const transformer = this.transformers.get(input.businessEventType);
    if (!transformer) {
      throw new Error(`NO_TRANSFORMER_REGISTERED:${input.businessEventType}`);
    }
    return transformer(input);
  }

  listRegisteredTypes(): readonly PipelineBusinessEventType[] {
    return [...this.transformers.keys()];
  }
}

export const defaultTransformationRegistry = new TransformationRegistry();
