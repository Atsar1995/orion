import { randomUUID } from "crypto";
import { publishBillingEvent } from "@/lib/hospitality/billing/billing-events";
import type { BillingRepository } from "@/lib/hospitality/repositories/BillingRepository";
import type {
  BillingDashboardView,
  FolioDetailView,
  FolioListItem,
  RevenueDashboardView,
} from "@/lib/hospitality/models/billing";
import type {
  BillingBriefSignals,
  ChargeCategory,
  CollectDepositInput,
  CreateAdjustmentInput,
  CreateFolioInput,
  FolioRecord,
  GenerateInvoiceInput,
  IssueRefundInput,
  PostChargeInput,
  ProcessPaymentInput,
  RevenueEventRecord,
} from "@/types/hospitality-billing";
import type { ServiceContext } from "@/types/services";

type BillingContext = ServiceContext;

const DEFAULT_TAX_RATE = 0.12;

function chargeTotal(charges: { amount: number; taxAmount: number }[]): number {
  return charges.reduce((sum, entry) => sum + entry.amount + entry.taxAmount, 0);
}

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** Tax calculation for hospitality charges. */
export class TaxEngine {
  calculate(amount: number, category: ChargeCategory, taxCode = "GST-12") {
    const rate = category === "discount" ? 0 : taxCode === "GST-12" ? DEFAULT_TAX_RATE : DEFAULT_TAX_RATE;
    const taxAmount = Math.round(amount * rate);
    return { taxRate: rate, taxAmount, taxCode, total: amount + taxAmount };
  }
}

/** Rate lookup from accommodation and reservation context. */
export class PricingService {
  constructor(private readonly repository: BillingRepository) {}

  lookupReservationRate(reservationId: string): number {
    const record = this.repository.getReservationRecord(reservationId);
    if (record) return record.rate;
    const legacy = this.repository.getReservation(reservationId);
    return legacy?.rate ?? 4500;
  }

  lookupAccommodationBaseRate(accommodationTypeId: string): number {
    const type = this.repository.getAccommodationType(accommodationTypeId);
    return type?.baseRate ?? 4500;
  }
}

/** Billing validation rules. */
export class BillingRulesEngine {
  canPostCharge(folio: FolioRecord | null): boolean {
    return folio?.status === "open" || folio?.status === "pending_settlement";
  }

  canProcessPayment(folio: FolioRecord | null): boolean {
    return folio?.status === "open" || folio?.status === "pending_settlement";
  }

  canSettle(folio: FolioRecord | null, balance: number): boolean {
    return (folio?.status === "open" || folio?.status === "pending_settlement") && balance <= 0;
  }

  canRefund(folio: FolioRecord | null): boolean {
    return folio?.status === "settled" || folio?.status === "open";
  }
}

/** Folio lifecycle management. */
export class FolioService {
  constructor(
    private readonly repository: BillingRepository,
    private readonly rules: BillingRulesEngine,
  ) {}

  create(input: CreateFolioInput, context: BillingContext): FolioRecord {
    const existing = this.repository.getFolioByReservation(input.reservationId);
    if (existing) return existing;

    const now = new Date().toISOString();
    const record: FolioRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      propertyId: input.propertyId,
      folioType: input.folioType ?? "individual",
      reservationId: input.reservationId,
      stayId: input.stayId,
      guestId: input.guestId,
      masterFolioId: input.masterFolioId,
      companyAccountId: input.companyAccountId,
      status: "open",
      currency: "INR",
      createdAt: now,
      updatedAt: now,
    };
    return this.repository.createFolioRecord(record);
  }

  getDetail(folioId: string, context: BillingContext): FolioDetailView | null {
    const folio = this.repository.getFolioRecord(folioId);
    if (!folio || folio.organizationId !== context.organizationId) return null;

    const guest = this.repository.getGuest(folio.guestId);
    const charges = this.repository.listCharges(folioId);
    const payments = this.repository.listPayments(folioId);
    const deposits = this.repository.listDeposits(folioId);
    const adjustments = this.repository.listAdjustments(folioId);
    const invoices = this.repository.listInvoices(context.organizationId).filter((entry) => entry.folioId === folioId);

    const subtotal = charges.reduce((sum, entry) => sum + entry.amount, 0);
    const taxTotal = charges.reduce((sum, entry) => sum + entry.taxAmount, 0);
    const adjustmentTotal = adjustments.reduce((sum, entry) => sum + entry.amount, 0);
    const paid = payments.reduce((sum, entry) => sum + entry.amount, 0);
    const balance = subtotal + taxTotal - adjustmentTotal - paid;

    return {
      folio: {
        id: folio.id,
        folioType: folio.folioType.replaceAll("_", " "),
        status: folio.status.replaceAll("_", " "),
        guestName: guest?.name ?? "Unknown",
        reservationId: folio.reservationId,
        stayId: folio.stayId,
        companyAccountId: folio.companyAccountId,
        currency: folio.currency,
      },
      charges: charges.map((entry) => ({
        id: entry.id,
        description: entry.description,
        category: entry.category.replaceAll("_", " "),
        amount: entry.amount,
        taxAmount: entry.taxAmount,
        total: entry.amount + entry.taxAmount,
        postedAt: entry.postedAt,
      })),
      payments: payments.map((entry) => ({
        id: entry.id,
        amount: entry.amount,
        method: entry.method.replaceAll("_", " "),
        reference: entry.reference,
        postedAt: entry.postedAt,
      })),
      deposits: deposits.map((entry) => ({
        id: entry.id,
        amount: entry.amount,
        status: entry.status,
      })),
      adjustments: adjustments.map((entry) => ({
        id: entry.id,
        type: entry.type.replaceAll("_", " "),
        amount: entry.amount,
        reason: entry.reason,
      })),
      invoices: invoices.map((entry) => ({
        id: entry.id,
        type: entry.type.replaceAll("_", " "),
        invoiceNumber: entry.invoiceNumber,
        total: entry.total,
        status: entry.status,
      })),
      summary: { subtotal, taxTotal, adjustments: adjustmentTotal, paid, balance },
    };
  }

  getBalance(folioId: string, context: BillingContext): number {
    const detail = this.getDetail(folioId, context);
    return detail?.summary.balance ?? 0;
  }

  getOutstandingForStay(stayId: string, context: BillingContext): number {
    const folio = this.repository.getFolioByStay(stayId);
    if (!folio) return 0;
    return this.getBalance(folio.id, context);
  }

  settle(folioId: string, context: BillingContext, actorName: string): FolioRecord {
    const folio = this.repository.getFolioRecord(folioId);
    const balance = this.getBalance(folioId, context);
    if (!folio || folio.organizationId !== context.organizationId) throw new Error("FOLIO_NOT_FOUND");
    if (!this.rules.canSettle(folio, balance)) throw new Error("OUTSTANDING_BALANCE");

    const now = new Date().toISOString();
    const updated = this.repository.updateFolioRecord(folioId, { status: "settled", settledAt: now, updatedAt: now })!;

    publishBillingEvent(
      { eventType: "FolioSettled", folioId, amount: balance, actorId: context.userId, actorName },
      context,
    );
    return updated;
  }

  list(context: BillingContext, propertyId?: string): FolioListItem[] {
    const folios = this.repository.listFolioRecords(context.organizationId, propertyId);
    return folios.map((folio) => {
      const guest = this.repository.getGuest(folio.guestId);
      const charges = this.repository.listCharges(folio.id);
      const payments = this.repository.listPayments(folio.id);
      const adjustments = this.repository.listAdjustments(folio.id);
      const totalCharges = chargeTotal(charges);
      const paid = payments.reduce((sum, entry) => sum + entry.amount, 0);
      const adjustmentTotal = adjustments.reduce((sum, entry) => sum + entry.amount, 0);
      const balance = totalCharges - adjustmentTotal - paid;

      return {
        folioId: folio.id,
        folioType: folio.folioType.replaceAll("_", " "),
        guestName: guest?.name ?? "Unknown",
        reservationId: folio.reservationId,
        status: folio.status.replaceAll("_", " "),
        balance: formatCurrency(Math.max(balance, 0)),
        charges: charges.length,
        totalCharges,
        totalPaid: paid,
        isVip: guest?.loyaltyTier === "vip" || guest?.loyaltyTier === "platinum",
      };
    });
  }
}

/** Charge posting service. */
export class ChargeService {
  constructor(
    private readonly repository: BillingRepository,
    private readonly taxEngine: TaxEngine,
    private readonly rules: BillingRulesEngine,
    private readonly revenue: RevenueService,
  ) {}

  post(input: PostChargeInput, context: BillingContext, actorName: string) {
    const folio = this.repository.getFolioRecord(input.folioId);
    if (!folio || folio.organizationId !== context.organizationId) throw new Error("FOLIO_NOT_FOUND");
    if (!this.rules.canPostCharge(folio)) throw new Error("INVALID_FOLIO_STATUS");

    const tax = this.taxEngine.calculate(input.amount, input.category, input.taxCode);
    const now = new Date().toISOString();
    const charge = this.repository.createCharge({
      id: randomUUID(),
      organizationId: context.organizationId,
      propertyId: folio.propertyId,
      folioId: input.folioId,
      description: input.description,
      category: input.category,
      amount: input.amount,
      taxRate: tax.taxRate,
      taxAmount: tax.taxAmount,
      serviceChargeRate: input.serviceChargeRate,
      postedAt: now,
      postedBy: actorName,
      reference: input.reference,
    });

    this.repository.createTaxRecord({
      id: randomUUID(),
      organizationId: context.organizationId,
      propertyId: folio.propertyId,
      folioId: input.folioId,
      chargeId: charge.id,
      taxCode: tax.taxCode,
      rate: tax.taxRate,
      amount: tax.taxAmount,
      recordedAt: now,
    });

    this.repository.updateFolioRecord(input.folioId, { updatedAt: now });

    const reservation = this.repository.getReservation(folio.reservationId);
    this.revenue.recordChargeEvent(charge, folio, reservation?.channel, context);

    publishBillingEvent(
      {
        eventType: "ChargePosted",
        folioId: input.folioId,
        chargeId: charge.id,
        amount: charge.amount + charge.taxAmount,
        actorId: context.userId,
        actorName,
      },
      context,
    );
    return charge;
  }
}

/** Payment processing service. */
export class PaymentService {
  constructor(
    private readonly repository: BillingRepository,
    private readonly rules: BillingRulesEngine,
    private readonly folios: FolioService,
    private readonly revenue: RevenueService,
  ) {}

  process(input: ProcessPaymentInput, context: BillingContext, actorName: string) {
    const folio = this.repository.getFolioRecord(input.folioId);
    if (!folio || folio.organizationId !== context.organizationId) throw new Error("FOLIO_NOT_FOUND");
    if (!this.rules.canProcessPayment(folio)) throw new Error("INVALID_FOLIO_STATUS");

    const now = new Date().toISOString();
    const payment = this.repository.createPayment({
      id: randomUUID(),
      organizationId: context.organizationId,
      propertyId: folio.propertyId,
      folioId: input.folioId,
      amount: input.amount,
      method: input.method,
      reference: input.reference,
      postedAt: now,
      postedBy: actorName,
    });

    this.repository.updateFolioRecord(input.folioId, { updatedAt: now });
    this.revenue.recordPaymentEvent(payment, context);

    publishBillingEvent(
      {
        eventType: "PaymentReceived",
        folioId: input.folioId,
        paymentId: payment.id,
        amount: payment.amount,
        actorId: context.userId,
        actorName,
      },
      context,
    );

    const balance = this.folios.getBalance(input.folioId, context);
    if (balance <= 0 && folio.status === "open") {
      this.folios.settle(input.folioId, context, actorName);
    }

    return payment;
  }

  collectDeposit(input: CollectDepositInput, context: BillingContext, actorName: string) {
    const folio = this.repository.getFolioRecord(input.folioId);
    if (!folio || folio.organizationId !== context.organizationId) throw new Error("FOLIO_NOT_FOUND");

    const deposit = this.repository.createDeposit({
      id: randomUUID(),
      organizationId: context.organizationId,
      propertyId: folio.propertyId,
      folioId: input.folioId,
      amount: input.amount,
      method: input.method,
      status: "held",
      collectedAt: new Date().toISOString(),
    });

    publishBillingEvent(
      {
        eventType: "DepositCollected",
        folioId: input.folioId,
        amount: input.amount,
        actorId: context.userId,
        actorName,
      },
      context,
    );
    return deposit;
  }

  issueRefund(input: IssueRefundInput, context: BillingContext, actorName: string) {
    const folio = this.repository.getFolioRecord(input.folioId);
    if (!folio || folio.organizationId !== context.organizationId) throw new Error("FOLIO_NOT_FOUND");
    if (!this.rules.canRefund(folio)) throw new Error("INVALID_FOLIO_STATUS");

    const refund = this.repository.createRefund({
      id: randomUUID(),
      organizationId: context.organizationId,
      propertyId: folio.propertyId,
      folioId: input.folioId,
      amount: input.amount,
      method: input.method,
      reason: input.reason,
      issuedAt: new Date().toISOString(),
    });

    publishBillingEvent(
      {
        eventType: "RefundIssued",
        folioId: input.folioId,
        amount: input.amount,
        actorId: context.userId,
        actorName,
      },
      context,
    );
    return refund;
  }

  createAdjustment(input: CreateAdjustmentInput, context: BillingContext) {
    const folio = this.repository.getFolioRecord(input.folioId);
    if (!folio || folio.organizationId !== context.organizationId) throw new Error("FOLIO_NOT_FOUND");

    return this.repository.createAdjustment({
      id: randomUUID(),
      organizationId: context.organizationId,
      propertyId: folio.propertyId,
      folioId: input.folioId,
      type: input.type,
      amount: input.amount,
      reason: input.reason,
      adjustedAt: new Date().toISOString(),
    });
  }
}

/** Invoice generation service. */
export class InvoiceService {
  constructor(private readonly repository: BillingRepository, private readonly folios: FolioService) {}

  generate(input: GenerateInvoiceInput, context: BillingContext, actorName: string) {
    const detail = this.folios.getDetail(input.folioId, context);
    if (!detail) throw new Error("FOLIO_NOT_FOUND");

    const folio = this.repository.getFolioRecord(input.folioId)!;
    const now = new Date().toISOString();
    const invoiceNumber = `ORH-${input.type === "proforma" ? "PRO" : input.type === "credit_note" ? "CRN" : "INV"}-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    const invoice = this.repository.createInvoice({
      id: randomUUID(),
      organizationId: context.organizationId,
      propertyId: folio.propertyId,
      folioId: input.folioId,
      type: input.type,
      status: input.type === "proforma" ? "issued" : "issued",
      invoiceNumber,
      subtotal: detail.summary.subtotal,
      taxTotal: detail.summary.taxTotal,
      total: detail.summary.subtotal + detail.summary.taxTotal - detail.summary.adjustments,
      issuedAt: now,
    });

    publishBillingEvent(
      {
        eventType: "InvoiceGenerated",
        folioId: input.folioId,
        invoiceId: invoice.id,
        amount: invoice.total,
        actorId: context.userId,
        actorName,
      },
      context,
    );
    return invoice;
  }

  list(context: BillingContext, propertyId?: string) {
    return this.repository.listInvoices(context.organizationId, propertyId);
  }
}

/** Revenue analytics and event recording. */
export class RevenueService {
  constructor(private readonly repository: BillingRepository) {}

  recordChargeEvent(
    charge: { id: string; folioId: string; category: ChargeCategory; amount: number; taxAmount: number },
    folio: FolioRecord,
    source: string | undefined,
    context: BillingContext,
  ) {
    const reservation = this.repository.getReservationRecord(folio.reservationId);
    const event: RevenueEventRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      propertyId: folio.propertyId,
      folioId: folio.id,
      reservationId: folio.reservationId,
      eventType: "charge_posted",
      category: charge.category,
      amount: charge.amount + charge.taxAmount,
      currency: folio.currency,
      source: source ?? reservation?.source,
      marketSegment: reservation?.isVip ? "vip" : reservation?.corporateAccount ? "corporate" : "leisure",
      accommodationTypeId: reservation?.accommodationTypeId,
      occurredAt: new Date().toISOString(),
    };
    this.repository.createRevenueEvent(event);
    publishBillingEvent(
      { eventType: "RevenueRecorded", folioId: folio.id, amount: event.amount, actorId: context.userId },
      context,
    );
  }

  recordPaymentEvent(payment: { folioId: string; amount: number }, context: BillingContext) {
    const folio = this.repository.getFolioRecord(payment.folioId);
    if (!folio) return;

    this.repository.createRevenueEvent({
      id: randomUUID(),
      organizationId: context.organizationId,
      propertyId: folio.propertyId,
      folioId: folio.id,
      reservationId: folio.reservationId,
      eventType: "payment_received",
      amount: payment.amount,
      currency: folio.currency,
      occurredAt: new Date().toISOString(),
    });
  }

  getDashboard(context: BillingContext, propertyId: string): RevenueDashboardView {
    const ops = this.repository.getOperationsSnapshot(propertyId);
    const events = this.repository.listRevenueEvents(context.organizationId, propertyId);

    const bySource = new Map<string, number>();
    for (const event of events) {
      if (event.source) {
        bySource.set(event.source, (bySource.get(event.source) ?? 0) + event.amount);
      }
    }
    const sourceTotal = [...bySource.values()].reduce((sum, value) => sum + value, 0) || 1;

    const byCategory = new Map<string, number>();
    for (const event of events) {
      if (event.category) {
        byCategory.set(event.category, (byCategory.get(event.category) ?? 0) + event.amount);
      }
    }

    const byAccommodation = new Map<string, number>();
    for (const event of events) {
      if (event.accommodationTypeId) {
        const type = this.repository.getAccommodationType(event.accommodationTypeId);
        const label = type?.name ?? event.accommodationTypeId;
        byAccommodation.set(label, (byAccommodation.get(label) ?? 0) + event.amount);
      }
    }

    const bySegment = new Map<string, number>();
    for (const event of events) {
      if (event.marketSegment) {
        bySegment.set(event.marketSegment, (bySegment.get(event.marketSegment) ?? 0) + event.amount);
      }
    }

    const properties = this.repository.listProperties(context.organizationId);

    return {
      dailyRevenue: ops.dailyRevenue,
      monthlyRevenue: ops.monthlyRevenue,
      adr: ops.adr,
      revpar: ops.revpar,
      byProperty: properties.map((property) => ({
        propertyId: property.id,
        propertyName: property.name,
        revenue: property.id === propertyId ? ops.dailyRevenue : Math.round(ops.dailyRevenue * 0.15),
      })),
      bySource: [...bySource.entries()].map(([source, revenue]) => ({
        source: source.replaceAll("_", " "),
        revenue,
        share: Math.round((revenue / sourceTotal) * 100),
      })),
      byAccommodationType: [...byAccommodation.entries()].map(([type, revenue]) => ({ type, revenue })),
      byMarketSegment: [...bySegment.entries()].map(([segment, revenue]) => ({ segment, revenue })),
    };
  }
}

/** Billing operations dashboard. */
export class BillingDashboardService {
  constructor(
    private readonly repository: BillingRepository,
    private readonly folios: FolioService,
    private readonly revenue: RevenueService,
  ) {}

  getDashboard(context: BillingContext, propertyId: string): BillingDashboardView {
    const folioItems = this.folios.list(context, propertyId);
    const ops = this.repository.getOperationsSnapshot(propertyId);

    let outstanding = 0;
    let pendingPayments = 0;
    for (const item of folioItems) {
      const balance = item.totalCharges - item.totalPaid;
      if (balance > 0) {
        outstanding += balance;
        if (item.status.includes("pending")) pendingPayments += 1;
      }
    }

    const openFolios = folioItems.filter((entry) => entry.status === "open").length;
    const settledToday = folioItems.filter((entry) => entry.status === "settled").length;

    const byCategory = new Map<string, number>();
    for (const folio of this.repository.listFolioRecords(context.organizationId, propertyId)) {
      for (const charge of this.repository.listCharges(folio.id)) {
        const label = charge.category.replaceAll("_", " ");
        byCategory.set(label, (byCategory.get(label) ?? 0) + charge.amount + charge.taxAmount);
      }
    }

    const recentPayments = this.repository
      .listFolioRecords(context.organizationId, propertyId)
      .flatMap((folio) =>
        this.repository.listPayments(folio.id).map((payment) => ({
          folioId: folio.id,
          guestName: this.repository.getGuest(folio.guestId)?.name ?? "Unknown",
          amount: payment.amount,
          method: payment.method.replaceAll("_", " "),
        })),
      )
      .slice(0, 5);

    return {
      summary: {
        todaysRevenue: ops.dailyRevenue,
        outstandingBalances: outstanding,
        pendingPayments,
        openFolios,
        settledToday,
        averageDailyRate: ops.adr,
        revpar: ops.revpar,
      },
      folios: folioItems,
      recentPayments,
      revenueByCategory: [...byCategory.entries()].map(([category, amount]) => ({ category, amount })),
    };
  }
}

/** Facade for Billing, Folio & Revenue Operations (Mission P-007.6). */
export class HospitalityBillingFacade {
  readonly folios: FolioService;
  readonly charges: ChargeService;
  readonly payments: PaymentService;
  readonly invoices: InvoiceService;
  readonly revenue: RevenueService;
  readonly dashboard: BillingDashboardService;
  readonly tax: TaxEngine;
  readonly pricing: PricingService;
  readonly rules: BillingRulesEngine;
  readonly repository: BillingRepository;

  constructor(repository: BillingRepository) {
    this.repository = repository;
    this.rules = new BillingRulesEngine();
    this.tax = new TaxEngine();
    this.pricing = new PricingService(repository);
    this.revenue = new RevenueService(repository);
    this.folios = new FolioService(repository, this.rules);
    this.charges = new ChargeService(repository, this.tax, this.rules, this.revenue);
    this.payments = new PaymentService(repository, this.rules, this.folios, this.revenue);
    this.invoices = new InvoiceService(repository, this.folios);
    this.dashboard = new BillingDashboardService(repository, this.folios, this.revenue);
  }

  getBriefSignals(context: BillingContext, propertyId: string): BillingBriefSignals {
    const dashboard = this.dashboard.getDashboard(context, propertyId);
    const guests = this.repository.listGuests(context.organizationId);
    const highValue = guests.filter((entry) => entry.totalSpend >= 50000 || entry.loyaltyTier === "vip").length;

    return {
      todaysRevenue: dashboard.summary.todaysRevenue,
      outstandingBalances: dashboard.summary.outstandingBalances,
      pendingPayments: dashboard.summary.pendingPayments,
      averageDailyRate: dashboard.summary.averageDailyRate,
      revpar: dashboard.summary.revpar,
      highValueGuestCount: highValue,
      openFolioCount: dashboard.summary.openFolios,
    };
  }
}
