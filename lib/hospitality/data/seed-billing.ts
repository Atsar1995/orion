import { DEFAULT_PROPERTY_ID } from "@/lib/hospitality/constants";
import type {
  AdjustmentRecord,
  ChargeRecord,
  DepositRecord,
  FolioRecord,
  InvoiceRecord,
  PaymentRecord,
  RefundRecord,
  RevenueEventRecord,
  TaxRecord,
} from "@/types/hospitality-billing";

const ORG_ID = "org-orania";
const NOW = "2026-07-30T09:00:00.000Z";

export function buildBillingSeed(): {
  folios: FolioRecord[];
  charges: ChargeRecord[];
  payments: PaymentRecord[];
  deposits: DepositRecord[];
  refunds: RefundRecord[];
  adjustments: AdjustmentRecord[];
  invoices: InvoiceRecord[];
  taxRecords: TaxRecord[];
  revenueEvents: RevenueEventRecord[];
} {
  const folios: FolioRecord[] = [
    {
      id: "folio-001",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      folioType: "individual",
      reservationId: "res-005",
      stayId: "stay-res-005",
      guestId: "guest-wilson",
      status: "open",
      currency: "INR",
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "folio-002",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      folioType: "individual",
      reservationId: "res-004",
      stayId: "stay-res-004",
      guestId: "guest-sharma",
      status: "settled",
      currency: "INR",
      createdAt: NOW,
      updatedAt: NOW,
      settledAt: NOW,
    },
    {
      id: "folio-003",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      folioType: "individual",
      reservationId: "res-006",
      stayId: "stay-res-006",
      guestId: "guest-nair",
      status: "open",
      currency: "INR",
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "folio-004",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      folioType: "company",
      reservationId: "res-003",
      stayId: "stay-res-003",
      guestId: "guest-kapoor",
      companyAccountId: "corp-india-ltd",
      status: "pending_settlement",
      currency: "INR",
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "folio-005",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      folioType: "master",
      reservationId: "res-007",
      guestId: "guest-mehta",
      status: "open",
      currency: "INR",
      createdAt: NOW,
      updatedAt: NOW,
    },
  ];

  const charges: ChargeRecord[] = [
    {
      id: "ch-001",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      folioId: "folio-001",
      description: "Room charge — Royal Suite (3 nights)",
      category: "accommodation",
      amount: 36000,
      taxRate: 0.12,
      taxAmount: 4320,
      postedAt: NOW,
    },
    {
      id: "ch-002",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      folioId: "folio-001",
      description: "In-room dining",
      category: "food_beverage",
      amount: 2800,
      taxRate: 0.12,
      taxAmount: 336,
      postedAt: NOW,
    },
    {
      id: "ch-003",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      folioId: "folio-002",
      description: "Room charges (3 nights)",
      category: "accommodation",
      amount: 12600,
      taxRate: 0.12,
      taxAmount: 1512,
      postedAt: NOW,
    },
    {
      id: "ch-004",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      folioId: "folio-003",
      description: "Standard room (2 nights)",
      category: "accommodation",
      amount: 9000,
      taxRate: 0.12,
      taxAmount: 1080,
      postedAt: NOW,
    },
    {
      id: "ch-005",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      folioId: "folio-003",
      description: "Laundry service",
      category: "laundry",
      amount: 450,
      taxRate: 0.12,
      taxAmount: 54,
      postedAt: NOW,
    },
    {
      id: "ch-006",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      folioId: "folio-004",
      description: "Corporate deluxe room (3 nights)",
      category: "accommodation",
      amount: 14400,
      taxRate: 0.12,
      taxAmount: 1728,
      postedAt: NOW,
    },
    {
      id: "ch-007",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      folioId: "folio-004",
      description: "Spa — executive package",
      category: "spa",
      amount: 6500,
      taxRate: 0.12,
      taxAmount: 780,
      postedAt: NOW,
    },
  ];

  const payments: PaymentRecord[] = [
    {
      id: "pay-001",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      folioId: "folio-001",
      amount: 25000,
      method: "card",
      reference: "TXN-88421",
      postedAt: NOW,
    },
    {
      id: "pay-002",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      folioId: "folio-002",
      amount: 14112,
      method: "digital_wallet",
      reference: "UPI-99201",
      postedAt: NOW,
    },
    {
      id: "pay-003",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      folioId: "folio-003",
      amount: 5000,
      method: "cash",
      postedAt: NOW,
    },
    {
      id: "pay-004",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      folioId: "folio-004",
      amount: 10000,
      method: "corporate_billing",
      reference: "CORP-INV-4421",
      postedAt: NOW,
    },
  ];

  const deposits: DepositRecord[] = [
    {
      id: "dep-001",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      folioId: "folio-001",
      amount: 15000,
      method: "card",
      status: "held",
      collectedAt: NOW,
    },
  ];

  const refunds: RefundRecord[] = [];

  const adjustments: AdjustmentRecord[] = [
    {
      id: "adj-001",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      folioId: "folio-004",
      type: "discount",
      amount: 500,
      reason: "Corporate loyalty discount",
      adjustedAt: NOW,
    },
  ];

  const invoices: InvoiceRecord[] = [
    {
      id: "inv-001",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      folioId: "folio-002",
      type: "tax_invoice",
      status: "paid",
      invoiceNumber: "ORH-INV-2026-0042",
      subtotal: 12600,
      taxTotal: 1512,
      total: 14112,
      issuedAt: NOW,
    },
    {
      id: "inv-002",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      folioId: "folio-004",
      type: "proforma",
      status: "issued",
      invoiceNumber: "ORH-PRO-2026-0018",
      subtotal: 20900,
      taxTotal: 2508,
      total: 23408,
      issuedAt: NOW,
    },
  ];

  const taxRecords: TaxRecord[] = charges.map((charge) => ({
    id: `tax-${charge.id}`,
    organizationId: ORG_ID,
    propertyId: DEFAULT_PROPERTY_ID,
    folioId: charge.folioId,
    chargeId: charge.id,
    taxCode: "GST-12",
    rate: charge.taxRate,
    amount: charge.taxAmount,
    recordedAt: charge.postedAt,
  }));

  const revenueEvents: RevenueEventRecord[] = [
    {
      id: "rev-001",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      folioId: "folio-001",
      reservationId: "res-005",
      eventType: "charge_posted",
      category: "accommodation",
      amount: 36000,
      currency: "INR",
      source: "travel_agent",
      marketSegment: "leisure",
      accommodationTypeId: "acc-rt-suite",
      occurredAt: NOW,
    },
    {
      id: "rev-002",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      folioId: "folio-002",
      reservationId: "res-004",
      eventType: "folio_settled",
      amount: 14112,
      currency: "INR",
      source: "ota",
      marketSegment: "leisure",
      occurredAt: NOW,
    },
    {
      id: "rev-003",
      organizationId: ORG_ID,
      propertyId: DEFAULT_PROPERTY_ID,
      eventType: "payment_received",
      amount: 840000,
      currency: "INR",
      occurredAt: NOW,
    },
  ];

  return { folios, charges, payments, deposits, refunds, adjustments, invoices, taxRecords, revenueEvents };
}
